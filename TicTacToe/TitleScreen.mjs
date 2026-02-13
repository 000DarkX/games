import {Engine, Frame} from "./Engine.mjs";
import {inputTick} from "./input.mjs";

export default class TitleScreen extends Frame {
    constructor() {
        super();
        this.selected   = 0;
        this.buttons    = [];
        this.running    = false;
        this.actionDownFn = (e => {
            if (e.detail.time <= 15) return;
            console.log(this.selected);
            this.adjustSelected.call(this, this.wrap(this.selected + 1, this.buttons.length));
        }).bind(this);
        this.actionUpFn = (e => {
            if (e.detail.time <= 15) return;
            this.adjustSelected.call(this, this.wrap(this.selected - 1, this.buttons.length));
        }).bind(this);
        this.actionAFn = (e => {
            if (e.detail.time <= 15) return;
            this.actionA.call(this, this.engine);
        }).bind(this);
        
    }

    init(e) {
        e.state.botSkill =0;
        this.button = e.addImage("button", `static/Sprite-0003-3.png`);
        this.cursor = e.addImage("cursor", `static/Sprite-0001-cursor.png`);
    }

    wrap(n, max) {
        return ((n % max) + max) % max;
    }

    frame(t) {
        if (!this.running) return;
        for (let i = 0; i < 4; ++i) {
            inputTick(i);
        }
    }

    adjustSelected(id) {
        let btn = this.buttons[this.selected];
        btn.children[1].hide();
        this.selected = id;
        btn = this.buttons[this.selected];
        btn.children[1].show();
    }

    actionA(e) {
        switch (this.selected) {
            case 0: e.switchFrame("play"); break;
            case 1:
                this.state.peerMode = true;
                e.switchFrame("play");
            break;
            case 2: e.switchFrame("options"); break;
            case 3: history.back(); break;
        }
    }

    createButton(e, text, x, y, selected=false) {
        const id = this.buttons.length;
        var button = new Konva.Label({
            x,
            y,
            width: 120,
            opacity: 0.75
        });
        e.layer.add(button);
        
        this.buttons.push(button);

        const img = new Konva.Image({
            image: this.button,
            width: 120,
            height: 30,
            draggable: true
        });
        button.add(img);

        const cimg = new Konva.Image({
            image: this.cursor,
            width: 30,
            height: 30,
            visible: selected,
            x: -30
        });
        button.add(cimg);
        const anim = new Konva.Animation(function(frame) {
            const time = frame.time;
            const timeDiff = frame.timeDiff;
            const frameRate = frame.frameRate;
            const x = -30 + Math.trunc(frame.time / 40) % 10;
            cimg.position({ x });
        }, e.layer);
        anim.start();

        button.on("mouseenter", this.adjustSelected.bind(this, id));
        button.on("mousedown", this.actionA.bind(this, e));

        button.add(new Konva.Text({
            text,
            fontSize: 18,
            width: 120,
            padding: 5,
            fill: 'white',
            align: "center"
        }));
    }

    enter(e) {
        removeEventListener("action_A", this.actionAFn);
        removeEventListener("action_down", this.actionDownFn);
        removeEventListener("action_up", this.actionUpFn);
        addEventListener("action_down", this.actionDownFn);
        addEventListener("action_up", this.actionUpFn);
        addEventListener("action_A", this.actionAFn);

        this.engine  = e;
        this.state   = e.state;
        this.state.peerMode = false;
        this.running = true;
        const container = e.stage.container();
        const canvas    = container.querySelector("canvas");

        e.stage.container().style.backgroundColor = 'black';

        const titleText = "TicTacToe";
        const measure1  = canvas.getContext("2d").measureText(titleText);
        const title = new Konva.Text({
            x: 0,
            y: 20,
            width: e.width,
            align: "center",
            text: titleText,
            fontSize: 25,
            stroke: "white",
        });
        e.layer.add(title);

        const buttonTexts = ["Play","Multi","Options","Exit"];
        for (let i = 0; i < buttonTexts.length; ++i) {
            this.createButton(e, buttonTexts[i], e.width / 2 - 120 / 2, e.height /2 + i * 30, i == this.selected);
        }

        this.timer = setInterval(() => {
            this.frame();
        }, 0);
    }

    leave() {
        clearInterval(this.timer);
        removeEventListener("action_A", this.actionAFn);
        removeEventListener("action_down", this.actionDownFn);
        removeEventListener("action_up", this.actionUpFn);
        this.selected   = 0;
        this.buttons    = [];
        this.running    = false;
    }
}
        