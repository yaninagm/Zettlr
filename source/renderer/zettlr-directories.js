/**
* @ignore
* BEGIN HEADER
*
* Contains:        ZettlrDirectories class
* CVM-Role:        Model
* Maintainer:      Hendrik Erz
* License:         GNU GPL v3
*
* Description:     This class controls the directory tree view
*
* END HEADER
*/

const TreeView      = require('./tree-view-list.js');
const EmptyPaths    = require('./empty-paths.js');

/**
* This class acts as the intermediary between the actual directories in memory
* and the visual experience of the user. It can refresh itself and change if
* it intelligently detects changes, so all you need to do is call refresh() from
* time to time, to reflect changes in memory visually.
*/
class ZettlrDirectories
{
    /**
    * Initialize the object
    * @param {ZettlrRenderer} parent The renderer object
    */
    constructor(parent)
    {
        this._renderer = parent;
        this._div = $('#directories');
        this._tree = [];
        this._empty = new EmptyPaths(this);
    }

    /**
    * Render a new directory list.
    * @return {ZettlrDirectories} Chainability.
    */
    refresh()
    {
        if(this._renderer.getPaths().length == 0) {
            // EmptyPaths simply displays a "hello please open something" message.
            this._empty.show();
            return this;
        }

        this._empty.hide();

        // First determine how many objects we have to display
        let l = this._renderer.getPaths().length;

        // No children, so detach any that we may have and return.
        if(l == 0) {
            for(let t of this._tree) {
                t.detach();
            }
            this._tree = []; // Dereference
            this._empty.show(); // Display the no-dirs message
            $('#arrow-button').addClass('hidden'); // In case it's displayed when the last dir is closed, we have to re-hide it
            return this;
        }

        // Detach all objects that are no longer present
        for(let t of this._tree) {
            if(!this._renderer.getPaths().find((elem) => {return (elem.hash == t.getHash());})) {
                t.detach();
            }
        }

        // Allocate target array
        let target = new Array(l);

        // Iterate over the new objects
        let x = this._renderer.getPaths(); // Ease of access
        for(let i = 0; i < x.length; i++) {
            // First check if we've already gotten that object in our list
            let found = this._tree.find((elem) => {return elem.getHash() == x[i].hash;});
            if(found != undefined) {
                // Got it -> insert at correct position in target array and refresh
                target[i] = this._tree[this._tree.indexOf(found)];
                target[i].refresh(x[i]);
            } else {
                // New object -> add
                target[i] = new TreeView(this, x[i], true);
            }
            target[i].setTarget(i);
        }

        // Swap
        this._tree = target;

        // Now move to target
        for(let t of this._tree) {
            t.moveToTarget();
        }

        // Select everything that may be selected.
        this.select();

        return this;
    }

    /**
    * Empties the directory list.
    * @return {ZettlrDirectories} Chainability.
    */
    empty()
    {
        for(let t of this._tree) {
            t.detach(); // Removes all descendants as well
            this._tree.splice(this._tree.indexOf(t), 1); // Remove from list
        }
        return this;
    }

    /**
    * Select a directory (i.e. a TreeView)
    * @param  {Integer} hash The hash of the tree view that should be selected
    * @return {ZettlrDirectories}      Chainability.
    */
    select(hash)
    {
        for(let t of this._tree) {
            t.deselect();
            // As each hash is unique, there now will be at maximum two lines be selected
            if(this._renderer.getCurrentDir() != null) {
                t.select(this._renderer.getCurrentDir().hash);
            }
            if(this._renderer.getCurrentFile() != null) {
                t.select(this._renderer.getCurrentFile().hash);
            }
        }

        return this;
    }

    /**
    * Purely dummy function for recursive use of uncollapse. Does simply put: NOTHING.
    * @return {void} This function does nothing, it returns nothing, it is nothing.
    */
    uncollapse()
    {
        // Do nothing. Dummy function b/c recursion
    }

    /**
    * Returns the directory container (#directories)
    * @return {jQuery} The DOM element
    */
    getContainer() { return this._div; }

    /**
    * Toggle the theme on the div.
    * @return {ZettlrDirectories} Chainability.
    */
    toggleTheme()
    {
        this._div.toggleClass('dark');
        return this;
    }

    /**
     * Is the directory pane currently hidden?
     * @return {Boolean} True or false, depending on the class.
     */
    isHidden() { return this._div.hasClass('hidden'); }

    /**
     * Show the directories pane (by removing the hidden class)
     */
    show() { this._div.removeClass('hidden'); }

    /**
     * Hide the directories pane (by adding the hidden class)
     */
    hide() { this._div.addClass('hidden'); }

    /**
    * Needed for bubbling up of selections
    * @param  {Integer} hash The hash of the directory to be selected
    * @return {void}      Nothing to return.
    */
    requestDir(hash) { this._renderer.requestDir(hash); }

    /**
    * If the user clicks one of the standalone files
    * @param  {Number} hash The hash of the file to be opened
    */
    requestFile(hash) { this._renderer.requestFile(hash); }

    /**
    * Needed for bubbling up of selections
    * @param  {Integer} from Hash representing the source dir
    * @param  {Integer} to   Hash representing the target dir
    * @return {void}      Nothing to return.
    */
    requestMove(from, to) { this._renderer.requestMove(from, to); }

    /**
     * Returns the renderer reference
     * @return {ZettlrRenderer} The renderer object
     */
    getRenderer() { return this._renderer; }
}

module.exports = ZettlrDirectories;
