const sceneWidth = 960;
const sceneHeight = 540;

export class Frame {
    constructor() {

    }

    init(e) {

    }

    enter(e) {

    }

    leave(e) {
        
    }
}


export class Engine {
    constructor() {
        this.currentFrame = null;
        this.frames       = {};
        this.state        = {
            images: {}
        };
        this.width        = 960;
        this.height       = 540;
    }

    addImage(name, src) {
        const image = new Image();
        image.onlaod = e => {
            this.state.images[name] = image;
        };
        image.src = src;
        return image;
    }

    enterFrame(frame) {
        this.currentFrame?.leave(this, this.state);
        this.currentFrame = frame;
        // clean up last layer/stage
        this.stage.destroyChildren();
        const layer = new Konva.Layer();
        this.layer  = layer;
        this.stage.add(layer);
        // enter
        this.currentFrame?.enter(this, this.state);
    }

    switchFrame(name) {
        this.enterFrame(this.frames[name]);
    }

    addFrame(name, frame) {
        frame.init(this);
        if (this.currentFrame == null) this.enterFrame(frame);
        this.frames[name] = frame;
    }

    start(container, width, height) {
        const stage = new Konva.Stage({
            container: container, // id of container <div>
            width: width || window.innerWidth,
            height: height || window.innerHeight
        });
        this.stage = stage;

        const layer = new Konva.Layer();
        this.layer  = layer;
        stage.add(layer);

        // Function to make the stage responsive
        function fitStageIntoParentContainer() {
            // Get the container element
            const container = stage.container();

            // Make the container take up the full width
            container.style.width = '100%';
            container.style.height = '100%';

            // Get current container width
            const scaleX = container.offsetWidth / sceneWidth;
            const scaleY = container.offsetHeight / sceneHeight;

            // Set stage dimensions and scale
            stage.width(window.innerWidth);
            stage.height(window.innerHeight);
            stage.scale({ x: scaleX, y: scaleY });
        }

        // Initial fit
        fitStageIntoParentContainer();

        // Adapt the stage on window resize
        window.addEventListener('resize', fitStageIntoParentContainer);
    }
}

