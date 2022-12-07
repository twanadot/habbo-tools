
var destFiguremap, destFiguredata, sourceFiguremap, sourceFiguredata, sourceFurnidata;

this.onmessage = (e) => {
    console.log(e.data);

    if (e.data.destFiguremap) {
        destFiguremap = e.data.destFiguremap;
        destFiguredata = e.data.destFiguredata;
        sourceFiguremap = e.data.sourceFiguremap;
        sourceFiguredata = e.data.sourceFiguredata;
        sourceFurnidata = e.data.sourceFurnidata;

        try {
            beginComparison();
        } catch (exception) {
            postMessage({"error": "Something went wrong while comparing files! More information in console."});
            console.log(exception);
        }
    }
}

function beginComparison() {
    var newParts = [];

    var itemsAdded = [];
    var itemsInfo = [];

    var newFurnidata = "";

    var setsAdded = 0;
    var libsAdded = 0;

    var newClothing = [];

    let libMatches = sourceFiguremap.match(new RegExp(MATCH_LIB, 'gs'));

    if (libMatches === null) {
        postMessage({"error": "Could not read the source figuremap!"});
        return;
    }

    let libCount = libMatches.length;

    for (let i = 0; i < libCount; i++) {

        if (i % 10 === 0 || i === libCount - 1) {
            postMessage({ progress: i / libCount})
        }

        let lib = libMatches[i];

        let id = lib.match(new RegExp(MATCH_GET_ATTR.format('id')))[1];
        let hasLib = destFiguremap.match(new RegExp(MATCH_LIB_BY_ID.format(id), 'gs')) !== null;

        if (hasLib) continue;

        console.log(`Added new part ${id}`);

        newParts.push(id);
        libsAdded++;

        let clothingInfo = { "lib": id }

        destFiguremap = destFiguremap.splice(destFiguremap.indexOf('</map>'), lib);

        /* Find corresponding figuredata sets */
        let firstPartId = lib.match(new RegExp(MATCH_FIRST_PART_ID))[1];
        let setMatch = sourceFiguredata.match(new RegExp(MATCH_SET_BY_PART_ID_WITH_PARENT.format(firstPartId), 's'));

        if (setMatch === null) {
            newClothing.push(clothingInfo);
            continue;
        }

        let set = setMatch[1];

        let setType = setMatch[0].match(new RegExp(MATCH_GET_ATTR.format("type")))[1];
        let setId = set.match(new RegExp(MATCH_GET_ATTR.format("id")))[1];;

        destFiguredata = destFiguredata.replace(new RegExp(REGEX_SETTYPE_APPEND.format(setType), 's'), `$1${set}$2`)

        setsAdded++;

        clothingInfo["set"] = setId;
        newClothing.push(clothingInfo);
        
        /* Find corresponding furnidata entries */
        let clothingFurni = sourceFurnidata.match(new RegExp(MATCH_FURNI_BY_CUSTOMPARAM.format(setId), 's'));

        if (clothingFurni === null) continue;

        clothingFurni = clothingFurni[0];
        let classname = clothingFurni.match(new RegExp(MATCH_GET_ATTR.format('classname')))[1];
        let furniId = clothingFurni.match(new RegExp(MATCH_GET_ATTR.format('id')))[1];

        if (itemsAdded.includes(classname)) continue;

        let revision = clothingFurni.match(new RegExp(MATCH_TAG_VALUE.format('revision'), 's'));

        if (revision === null) revision = '';
        else revision = revision[1];

        let customparams = clothingFurni.match(new RegExp(MATCH_TAG_VALUE.format('customparams'), 's'))[1];
        let name = clothingFurni.match(new RegExp(MATCH_TAG_VALUE.format('name'), 's'))[1];

        let description = "";
        try {
            description = clothingFurni.match(new RegExp(MATCH_TAG_VALUE.format('description'), 's'))[1];
        } catch (exception) {
            console.log(`${name} did not have a description.`);
        }

        itemsAdded.push(classname);
        itemsInfo.push({classname: classname, revision: revision, id: furniId, setid: customparams, name: name, description: description });
        
        newFurnidata += clothingFurni + "\r\n";
    }

    var result = {
        done: true,
        destFiguredata: destFiguredata,
        destFiguremap: destFiguremap,
        newClothing: newClothing,
        setsAdded: setsAdded,
        libsAdded: libsAdded,
        newFurnidata: newFurnidata,
        itemsInfo: itemsInfo,
        newParts: newParts
    }

    console.log(result);
    postMessage(result);
}

if (!String.prototype.format) { // Format string with arguments
    String.prototype.format = function() {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function(match, number) { 
        return typeof args[number] != 'undefined'
            ? args[number]
            : match
        ;
        });
    };
}

if (String.prototype.splice === undefined) {
    /**
     * Splices text within a string.
     * @param {int} offset The position to insert the text at (before)
     * @param {string} text The text to insert
     * @param {int} [removeCount=0] An optional number of characters to overwrite
     * @returns {string} A modified string containing the spliced text.
     */
    String.prototype.splice = function(offset, text, removeCount=0) {
        let calculatedOffset = offset < 0 ? this.length + offset : offset;
        return this.substring(0, calculatedOffset) +
        text + this.substring(calculatedOffset + removeCount);
    };
}

const MATCH_LIB = "(<lib id=\"(.*?)\" revision=\"(?:.*?)\">(.*?)<\/lib>)",
      MATCH_LIB_BY_ID = "(<lib id=\"{0}\" revision=\"(?:.*?)\">(.*?)<\/lib>)",
      MATCH_GET_ATTR = "{0}=\"(.*?)\"",
      MATCH_FIRST_PART_ID = "(?:part id=\"(.*?)\" (?:.*?)\/>)",
      MATCH_SET_BY_PART_ID = "<set (?:(?!<set).)*?<part id=\"{0}\"(?:.*?)<\/set>",
      MATCH_SET_BY_PART_ID_WITH_PARENT = "<settype (?:(?!<settype).)*?(<set (?:(?!<set).)*?<part id=\"{0}\"(?:.*?)<\/set>)(?:.*?)<\/settype>",
      MATCH_FURNI_BY_CUSTOMPARAM = "<furnitype (?:(?!(<furnitype|classname=\"clothing_nt_)).)*?<customparams>(?:(?:\d|,)+,\b)?{0}(?:\b,(?:\d|,)+)?<\/customparams>(?:.*?)<\/furnitype>",
      MATCH_TAG_VALUE = "<{0}>(.*?)<\/{0}>",
      REGEX_SETTYPE_APPEND = "(<settype type=\"{0}\" (?:.*?))(<\/settype>)";


      
