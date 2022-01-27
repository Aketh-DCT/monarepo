AFRAME.registerComponent("toggle-visibility", {
    schema: {
        type: "selectorAll",
        default: null,
    },

    // =============================================================================
    // Built-in Lifecycle method. Called when entity and component are initialized.
    // =============================================================================

    init: function () {
        // ==========================================================
        // Custom property for our collection of entities to toggle.
        // ==========================================================

        this.entities = [];

        // ===================================================================
        // If no target entities are set, assign itself as target entity.
        // Otherwise, assign array from querySelectorAll() to this.entities[].
        // ===================================================================

        if (this.data === null) {
            this.entities.push(this.el);
        } else {
            this.entities = this.data;
        }

        // ==========================================================================
        // This just points to the toggleVisibility() method located far below.
        // We bind "this" to it so we can access "this.data" from within the method.
        // Otherwise, we wouldn't be able to easily.
        // It is done this way to be able to remove the listener when we want.
        // ==========================================================================

        this.toggleHandler = this.toggleVisibility.bind(this);
    },

    // ==============================================================================
    // Built-in Lifecycle method. Called when initialized and when play() is called.
    // ==============================================================================

    play: function () {
        // ==========================================================================
        // Add event listener for click event when entity is visible.
        // Note this is not automatic when hiding and unhiding the entity.
        // We will be telling the component to pause and play the entity from within
        // toggleVisibility() to achieve the desired effect.
        // ==========================================================================

        this.el.addEventListener("click", this.toggleHandler);
    },

    // =========================================================================================
    // Built-in Lifecycle method. Called when pause() is called and when the entity is removed.
    // =========================================================================================

    pause: function () {
        // ================================================================================
        // Remove event listener for click event so it does not fire when entity is hidden.
        // Note this is not automatic when hiding and unhiding the entity.
        // We will be telling the component to pause and play the entity from within
        // toggleVisibility() to achieve the desired effect.
        // ================================================================================

        this.el.removeEventListener("click", this.toggleHandler);
    },

    // ===========================================
    // Our custom method for toggling visibility.
    // ===========================================

    toggleVisibility: function (e) {
        // ==========================
        // Variable for convenience.
        // ==========================

        var entities = this.entities;

        // ================================
        // Reference to our cursor entity.
        // ================================

        var cursor = this.el.sceneEl.querySelector("[cursor]");

        // ==============================
        // Loop through target entities.
        // ==============================

        for (var i = 0; i < entities.length; i++) {
            // =================================================================================================
            // If visible, hide and pause (remove listeners); if hidden, make visible and play (add listeners).
            // =================================================================================================

            if (entities[i].object3D.visible === true) {
                // ===================
                // Entity is visible.
                // ===================

                // ================================================================
                // Hides target. Ironically, the easiest part of what we're doing.
                // ================================================================

                entities[i].object3D.visible = false;

                // ==============================================================================
                // Pauses target -- calls pause() lifecycle method which removes event listener.
                // ==============================================================================

                entities[i].pause();

                // ===================================================================
                // Replace clickable class so there is no interaction with raycaster.
                // ===================================================================

                // Not supported in Edge or Samsung Internet.
                // entities[i].classList.replace('clickable', 'clickable-disabled');

                // Workaround
                entities[i].classList.remove("clickable");
                entities[i].classList.add("clickable-disabled");

                // ======================================================================
                // Updates raycaster objects in scene -- updates class names, etc.
                // Otherwise, removing the clickable class doesn't affect the raycaster.
                // ======================================================================

                cursor.components.raycaster.refreshObjects();
            } else {
                // =======================
                // Entity is not visible.
                // =======================

                // =====================================================
                // Restore clickable class so there can be interaction.
                // =====================================================

                // Not supported in Edge or Samsung Internet
                // entities[i].classList.replace('clickable-disabled', 'clickable');

                // Workaround
                entities[i].classList.remove("clickable-disabled");
                entities[i].classList.add("clickable");

                // =======================================================================
                // Updates raycaster objects in scene -- updates class names, etc.
                // Otherwise, restoring the clickable class doesn't affect the raycaster.
                // =======================================================================

                cursor.components.raycaster.refreshObjects();

                // =========================================================================
                // Plays target -- calls play() lifecycle method which adds event listener.
                // =========================================================================

                entities[i].play();

                // ===============
                // Unhide target.
                // ===============

                entities[i].object3D.visible = true;
            }
        }
    },
});
