import {Engine, Frame} from "./Engine.mjs";
import {inputTick} from "./input.mjs";

// Bot Easy
// Bot Medium
// Bot Hard

export default class OptionsScreen extends Frame {
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

    adjustSkill(id) {
        this.state.botSkill = (this.state?.botSkill||0) + 1;
        this.buttons[id].children[2].setAttr("text",`Skill: ${this.botSkill}`);
    }

    actionA(e) {
        switch (this.selected) {
            case 0:
                this.adjustSkill(this.selected);
            break;
            case 1: e.switchFrame("title"); break;
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

    get botSkill(){ 
        return ["Human", "Easy","Medium","Hard"][(this.state?.botSkill||0)%3];
    }

    enter(e, state) {
        // setup listeners
        removeEventListener("action_A", this.actionAFn);
        removeEventListener("action_down", this.actionDownFn);
        removeEventListener("action_up", this.actionUpFn);
        addEventListener("action_down", this.actionDownFn);
        addEventListener("action_up", this.actionUpFn);
        addEventListener("action_A", this.actionAFn);

        this.state =state;
        this.engine = e;
        this.running = true;
        const container = e.stage.container();
        const canvas    = container.querySelector("canvas");

        e.stage.container().style.backgroundColor = 'black';

        const buttonTexts = [`Skill: ${this.botSkill}`,"Back"];
        for (let i = 0; i < buttonTexts.length; ++i) {
            this.createButton(e, buttonTexts[i], e.width / 2 - 120 / 2, e.height /2 + i * 30, i == this.selected);
        }

        this.timer = setInterval(() => {
            this.frame();
        }, 0);
    }

    leave(e) {
        clearInterval(this.timer);
        removeEventListener("action_A", this.actionAFn);
        removeEventListener("action_down", this.actionDownFn);
        removeEventListener("action_up", this.actionUpFn);
        this.selected   = 0;
        this.buttons    = [];
        this.running    = false;
    }
}