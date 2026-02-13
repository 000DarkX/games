import {Engine, Frame} from "./Engine.mjs";
import {inputTick} from "./input.mjs";
import TicTacToeEngine from "./TicTacToe-2025.mjs";
import findBestMove from "./minmaxAI.mjs";
import EasyBot from "./easyBot.mjs";
import MediumBot from "./mediumBot.mjs";
import HardBot from "./HardBot.mjs";

// Bot Easy
// Bot Medium
// Bot Hard

export default class PlayScreen extends Frame {
    constructor() {
        super();
        this.clear();
        
        this.actionDownFn = (e => {
            if (e.detail.time <= 15) return;
            this.adjustCellSelected.call(this, e.detail.id, this.wrap(this.selectedCell[0], 3), this.wrap(this.selectedCell[1] + 1, 3));
        }).bind(this);
        
        this.actionUpFn = (e => {
            if (e.detail.time <= 15) return;
            this.adjustCellSelected.call(this, e.detail.id, this.wrap(this.selectedCell[0], 3), this.wrap(this.selectedCell[1] - 1, 3));
        }).bind(this);

        this.actionLeftFn = (e => {
            if (e.detail.time <= 15) return;
            this.adjustCellSelected.call(this, e.detail.id, this.wrap(this.selectedCell[0] - 1, 3), this.wrap(this.selectedCell[1], 3));
        }).bind(this);
        
        this.actionRightFn = (e => {
            if (e.detail.time <= 15) return;
            this.adjustCellSelected.call(this, e.detail.id, this.wrap(this.selectedCell[0] + 1, 3), this.wrap(this.selectedCell[1], 3));
        }).bind(this);

        this.actionAFn = (e => {
            if (e.detail.time <= 15) return;
            this.actionA.call(this, this.engine, e.detail.id);
        }).bind(this);

        this.actionBFn = (e => {
            if (e.detail.time <= 15) return;
            this.engine.switchFrame("title");
        }).bind(this);

        this.buttondownFn = (e => {
            if (e.key == "Escape") this.engine.switchFrame("title");
        }).bind(this);
    }

    init(e) {
        this.gameState = TicTacToeEngine.CONTINUE;
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

    adjustCellSelected(id, x, y) {
        if (this.game.turn === false && id == 1) return;
        if (this.game.turn === true && id == 0) return;

        let cell = this.cells[this.selectedCell[0]][this.selectedCell[1]];
        cell.children[1].hide();
        this.selectedCell = [x,y];

        cell = this.cells[this.selectedCell[0]][this.selectedCell[1]];
        cell.children[1].show();
        cell.children[1].setAttr("shadowColor", "green");
        cell.children[1].setAttr("text", this.game.turn?"O":"X");
    }

    adjustSkill(id) {
        this.state.botSkill = (this.state?.botSkill||0) + 1;
        this.buttons[id].children[2].setAttr("text",`Skill: ${this.botSkill}`);
    }

    actionA(e, id) {
        if (this.state.peerMode === true);
        else if (this.gameState != TicTacToeEngine.CONTINUE) {
            this.game.newGame();
            this.updateCells();
        }
        else if (this.game.turn === true && this.bot);
        else if (this.state.peerMode) {
            if (this.turn) {
                this.game.takeTurn(this.selectedCell[0] + this.selectedCell[1] * 3);
                this.updateCells();
                this.connection.send(this.selectedCell[0] + this.selectedCell[1] * 3);
                this.turn = false;
            }
        }
        else if ((this.game.turn === false && id == 0) || (this.state.botSkill == 0 && id == 1)) {
            this.game.takeTurn(this.selectedCell[0] + this.selectedCell[1] * 3);
            this.updateCells();
            if (this.game.turn === true && this.bot && this.gameState == TicTacToeEngine.CONTINUE) {
                this.game.takeTurn(this.bot.takeTurn(this.game.board, this.game.free));
                this.updateCells();
            }
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

    createCell(e, x, y, cellx, celly) {
        const size = Math.min(e.width, e.height);

        const base = new Konva.Label({
            x,
            y,
            width: size * 0.15,
            height: size * 0.15,
            opacity: 1
        });
        e.layer.add(base);

        base.on("mousedown", e => {
            this.selectedCell = [cellx,celly];
            this.actionA.call(this, e, this.game.turn?1:0);
        });

        base.on("mousemove", e => {
            this.adjustCellSelected(this.game.turn?1:0, cellx, celly);
        });

        const rect = new Konva.Rect({
            fill: 'white',
            stroke: 'gray',
            width: size * 0.15,
            height: size * 0.15,
            strokeWidth: 4,
        });
        base.add(rect);

        base.add(new Konva.Text({
            text: "X",
            fontSize: 18,
            y: size * 0.15 * 0.25,
            width: size * 0.15,
            height: size * 0.15,
            visible: (cellx == this.selectedCell[0] && celly == this.selectedCell[1]),
            padding: 5,
            fill: 'black',
            align: "center",
            shadowColor: (cellx == this.selectedCell[0] && celly == this.selectedCell[1]) ? "green" : "black",
            shadowBlur: 0,
            shadowOffset: { x: 5, y: 5 },
            shadowOpacity: 0.5,
        }));

        base.add(new Konva.Text({
            text: "_",
            fontSize: 18,
            y: size * 0.15 * 0.25,
            width: size * 0.15,
            height: size * 0.15,
            padding: 5,
            fill: 'black',
            align: "center",
            shadowColor: "black",
            shadowBlur: 0,
            shadowOffset: { x: 5, y: 5 },
            shadowOpacity: 0.5,
        }));

        if (this.cells.length <= cellx)
            this.cells[cellx] = [];
        this.cells[cellx][celly] = base;
    }

    get botSkill(){ 
        return ["Easy","Medium","Hard"][(this.state?.botSkill||0)%3];
    }

    clear() {
        this.selected   = 0;
        this.buttons    = [];
        this.selectedCell = [1, 1];
        this.cells      = [];
        this.running    = false;
        if (this.input) this.input.remove();
        if (this.button) this.button.remove();
    }

    initListeners(init=true) {
        removeEventListener("action_A", this.actionAFn);
        removeEventListener("action_B", this.actionBFn);
        removeEventListener("action_down", this.actionDownFn);
        removeEventListener("action_up", this.actionUpFn);
         removeEventListener("keydown", this.buttondownFn);
        if (init) {
            addEventListener("action_down", this.actionDownFn);
            addEventListener("action_up", this.actionUpFn);
            addEventListener("action_left", this.actionLeftFn);
            addEventListener("action_right", this.actionRightFn);
            addEventListener("action_A", this.actionAFn);
            addEventListener("action_B", this.actionBFn);
            addEventListener("keydown", this.buttondownFn);
        }
    }

    updateCells() {
        for (let i = 0; i < 3; ++i) {
            for (let j = 0; j < 3; ++j) {
                const cell = this.cells[j][i];
                const board = this.game.board[j+i*3];
                if (board === false) {
                    cell.children[2].setAttr("text", "X");
                } else if (board === true) {
                    cell.children[2].setAttr("text", "O");
                } else {
                    cell.children[2].setAttr("text", "_");
                }
            }
        }

        const state  = this.gameState = this.game.checkWin();

        switch (state) {
            case  TicTacToeEngine.WIN:
                this.engine.layer.children[9].setAttr("text", `${this.game.turn?"X":"O"} is Winner`);
            break;
            case  TicTacToeEngine.CATS:
                this.engine.layer.children[9].setAttr("text", `Cats Game`);
            break;
            default:
                this.engine.layer.children[9].setAttr("text", `${this.game.turn?"O":"X"}'s Turn`);
        }
    }

    enter(e, state) {
        this.game = new TicTacToeEngine();
        // setup listeners
        this.initListeners();

        this.state =state;
        this.engine = e;
        this.running = true;

        if (state.peerMode) {
            const peer  = this.peer = new Peer();
            const input = this.input = document.createElement("input");
            const btn   = this.button = document.createElement("button");
            input.style.position = "absolute";
            input.style.left = 0;
            input.style.top = 0;
            document.body.append(input);

            btn.style.position   = "absolute";
            btn.style.left = `0px`;
            btn.style.top = `${input.getBoundingClientRect().height}px`;
            btn.innerHTML = "Join";
            btn.onclick = e => {
                const conn = peer.connect(input.value);
                this.connection= conn;
                this.state.peerMode = "client";
                conn.on("data", id => {
                    console.log(`serv went, ${id}`);
                    this.game.takeTurn(id);
                    this.updateCells();
                    this.turn = true;
                });
            };
            document.body.append(btn);

            peer.on("open", id => {
                 this.input.value = id;
            });

            peer.on("connection", conn => {
                this.connection = conn;
                if (this.state.peerMode == "client") this.turn = false;
                else {
                    this.state.peerMode = "server"
                    this.turn = true;
                }
                conn.on("open", x => { 
                    conn.on("data", id => {
                        console.log(`client went, ${id}`);
                        this.game.takeTurn(id);
                        this.updateCells();
                        this.turn = true;
                    });
                });
            });
        }
        else if (state.botSkill > 0) {
            this.bot = [new EasyBot(), new MediumBot(), new HardBot()][(state.botSkill-1)%3];
        }
        
        const container = e.stage.container();
        const canvas    = container.querySelector("canvas");

        e.stage.container().style.backgroundColor = 'black';
        
        const size = Math.min(e.width, e.height);
        for (let i = 0; i < 3; ++i) {
            for (let j = 0; j < 3; ++j) {
                const width = size * 0.15;
                const x     = j * width;
                const y     = i * width;
                const offsetX = e.width * 0.5 - width * 2;
                this.createCell(e, x + offsetX, y, j, i);
            }
        }

        e.layer.add(new Konva.Text({
            text: "X's Turn",
            fontSize: 18,
            x: 0,
            y: e.height * 0.5,
            width: e.width,
            height: 30,
            padding: 5,
            fill: 'white',
            align: "center",
            shadowColor: "black",
            shadowBlur: 0,
            shadowOffset: { x: 5, y: 5 },
            shadowOpacity: 0.5,
        }));

        this.updateCells();

        this.timer = setInterval(() => {
            this.frame();
        }, 0);
    }

    leave(e) {
        clearInterval(this.timer);
        this.initListeners(false);
        this.clear();
    }
}