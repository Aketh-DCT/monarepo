// Component to control the visibility of AR content
AFRAME.registerComponent("visibility-changer", {
    init: function () {
        this.el.setAttribute("visible", false);
        this.el.parentElement.addEventListener("zappar-visible", () =>
            this.el.setAttribute("visible", true)
        );
        this.el.parentElement.addEventListener("zappar-notvisible", () =>
            this.el.setAttribute("visible", false)
        );
    },
});

// Component to control the visibility of navigation
AFRAME.registerComponent("navigation", {
    init: function () {
        this.el.setAttribute("visible", true);
        var contentEL = document.querySelector("#content");
        contentEL.parentElement.addEventListener("zappar-visible", () => {
            this.el.setAttribute("visible", false);
            this.el.removeAttribute("navigation");
        });
    },
});

// State Machine
AFRAME.registerState({
    initialState: {
        showIntro: true,
        showUI: false,
        showChallenge: false,
        show3D: false,
        task1: false,
        task2: false,
        task3: false,
    },

    handlers: {
        showUI: (state) => {
            state.showUI = true;
            state.showIntro = false;
        },

        task1: function (state) {
            state.task1 = true;
            var targetModal = new bootstrap.Modal(
                document.getElementById("modal-1"),
                {}
            );
            targetModal.toggle();
            if (state.task1 && state.task2 && state.task3) {
                AFRAME.scenes[0].emit("showChallenge", null, false);
            }
        },

        task2: function (state) {
            state.task2 = true;
            var targetModal = new bootstrap.Modal(
                document.getElementById("modal-2"),
                {}
            );
            targetModal.toggle();
            if (state.task1 && state.task2 && state.task3) {
                AFRAME.scenes[0].emit("showChallenge", null, false);
            }
        },

        task3: function (state) {
            state.task3 = true;
            state.show3D = true;
            state.showUI = false;
            if (state.task1 && state.task2 && state.task3) {
                AFRAME.scenes[0].emit("showChallenge", null, false);
            }
        },

        back: function (state) {
            state.show3D = false;
            state.showUI = true;
        },

        showChallenge: function (state) {
            state.showChallenge = true;
        },
    },
});

AFRAME.registerComponent("launch-ui", {
    init: function () {
        var el = this.el;
        var intro = document.querySelector("#introUI");
        el.addEventListener("click", function () {
            el.sceneEl.emit("showUI", null, false);
            intro.removeAttribute("launch-ui");
        });
    },
});

AFRAME.registerComponent("launch-challenge", {
    schema: {
        message: { type: "string" },
        modal: { type: "string" },
    },
    init: function () {
        let el = this.el;
        let evt = this.data.message;

        el.addEventListener("click", function () {
            el.sceneEl.emit(evt, null, false);
        });
    },
});

AFRAME.registerComponent("raycastable", {});
