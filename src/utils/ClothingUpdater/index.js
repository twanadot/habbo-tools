import jQuery from 'jquery';
import { CORS_PROXY_URL } from '../../Constants';
import vkbeautify from 'vkbeautify';
import FileDownloader from '../FileDownloader';
import { format } from '../Utility';
import ExternalVariables from '../ExternalVariables';

export default class ClothingUpdater {
    habboProductionUrl = "";
    habboHofFurniUrl = "";

    initialLoadCount = 0;
    initialLoadTarget = 4;

    stopExecution = false;

    constructor(options) {
        this.options = options;

        this.destFiguredataUrl = options.destFiguredataUrl;
        this.destFiguremapUrl = options.destFiguremapUrl;

        this.externalVariablesUrl = options.externalVariablesUrl;

        this.destFiguredata = options.destFiguredata;
        this.destFiguremap = options.destFiguremap;

        this.habboHofFurniUrl = options.hofFurniUrl;
        this.habboProductionUrl = options.productionUrl;
        
        this.start();
    }

    start = async () => {
        this.sendProgress({type: 'init', info: PROGRESS_INIT, percentage: 0});

        await this.loadManualValues();

        this.externalVariablesRaw = await this.loadInitialFile(CORS_PROXY_URL + this.externalVariablesUrl);
        this.hotelUrl = new URL(this.externalVariablesUrl);

        this.externalVariables = new ExternalVariables(this.externalVariablesRaw, this.hotelUrl);

        this.sourceFiguredataUrl = this.externalVariables.getUrl('external.figurepartlist.txt');
        this.sourceFiguremapUrl = this.externalVariables.getUrl('flash.dynamic.avatar.download.configuration');
        this.sourceFurnidataUrl = this.externalVariables.getUrl('furnidata.load.url');

        if (!this.habboProductionUrl) {
            this.habboProductionUrl = this.ensureValidProperty(this.externalVariables.getUrl('flash.client.url'), 'Production URL', true);
        }

        if (!this.habboHofFurniUrl) {
            this.habboHofFurniUrl = this.ensureValidProperty(this.externalVariables.getUrl('flash.dynamic.download.url'), 'HOF Furni URL', true);
        }

        this.ensureValidProperty(this.sourceFiguredataUrl, 'Figuredata URL', true);
        this.ensureValidProperty(this.sourceFiguremapUrl, 'Figuremap URL', true);
        this.ensureValidProperty(this.sourceFurnidataUrl, 'Furnidata URL', true);

        if (this.stopExecution) return;

        let promises = [];

        if (!this.destFiguremap) {
            this.initialLoadTarget++;
            let promise = this.loadInitialFile(CORS_PROXY_URL + this.destFiguremapUrl).then(res => this.destFiguremap = res);
            promises.push(promise);
        }

        if (!this.destFiguredata) {
            this.initialLoadTarget++;
            let promise = this.loadInitialFile(CORS_PROXY_URL + this.destFiguredataUrl).then(res => this.destFiguredata = res);
            promises.push(promise);
        }

        if (!this.sourceFiguredata) {
            let promise = this.loadInitialFile(CORS_PROXY_URL + this.sourceFiguredataUrl).then(res => this.sourceFiguredata = res);
            promises.push(promise);
        }

        if (!this.sourceFiguremap) {
            let promise = this.loadInitialFile(CORS_PROXY_URL + this.sourceFiguremapUrl).then(res => this.sourceFiguremap = res);
            promises.push(promise);
        }

        if (!this.sourceFurnidata) {
            let promise = this.loadInitialFile(CORS_PROXY_URL + this.sourceFurnidataUrl).then(res => this.sourceFurnidata = res);
            promises.push(promise);
        }

        await Promise.all(promises);

        if (this.stopExecution) return;

        this.sendProgress({type: 'comparing', info: PROGRESS_COMPARING, percentage: 0});

        this.worker = new Worker('./workers/clothing.worker.js');
        this.worker.onmessage = this.onWorkerMessage;

        this.worker.postMessage({
            destFiguremap: this.destFiguremap,
            destFiguredata: this.destFiguredata,
            sourceFiguredata: this.sourceFiguredata,
            sourceFiguremap: this.sourceFiguremap,
            sourceFurnidata: this.sourceFurnidata
        });
    }

    loadManualValues = async() => {
        let promises = [];

        if (this.options.sourceFiguredataUrl) {
            let promise = this.loadInitialFile(CORS_PROXY_URL + this.options.sourceFiguredataUrl).then(res => this.sourceFiguredata = res);
            promises.push(promise);
        }

        if (this.options.sourceFiguremapUrl) {
            let promise = this.loadInitialFile(CORS_PROXY_URL + this.options.sourceFiguremapUrl).then(res => this.sourceFiguremap = res);
            promises.push(promise);
        }

        if (this.options.sourceFurnidataUrl) {
            let promise = this.loadInitialFile(CORS_PROXY_URL + this.options.sourceFurnidataUrl).then(res => this.sourceFurnidata = res);
            promises.push(promise);
        }

        await Promise.all(promises);
    }

    ensureValidProperty = (property, name, isUrl) => {
        if (property === null) {
            let error = format(ERROR_EXTERNAL_VARIABLE_INVALID, name);

            this.sendError(error, error);
            this.stopExecution = true;
        }

        if (isUrl) {
            try {
                new URL(property);
            } catch(exception) {
                let error = format(ERROR_EXTERNAL_VARIABLE_INVALID, name);

                this.sendError(error, error);
                this.stopExecution = true;
            }
        }

        return property;
    }

    sendProgress = (progress) => {
        if (this.options.onProgress !== undefined) {
            this.options.onProgress(progress);
        }
    }

    sendError = (userError, consoleError) => {
        if (this.options.onError !== undefined) {
            this.options.onError(userError);
        }

        if (consoleError !== undefined) {
            console.log(consoleError);
        }
    }

    loadInitialFile = (url) => {
        return new Promise((resolve, reject) => {
            jQuery.ajax({
                url: url, 
                dataType: "text",
                success: (response) => {
                    try {
                        let jsonResponse = JSON.parse(response);
                        if (typeof(jsonResponse) === 'object' && jsonResponse.error) {
                            this.sendError(ERROR_NECESSARY_FILE, jsonResponse);
                            return;
                        }
                    } catch (exception) { } // This is supposed to be reached, since we aren't downloading JSON files here.

                    this.initialLoadCount++;
                    this.sendProgress({type: 'init', info: PROGRESS_INIT, percentage: this.initialLoadCount / this.initialLoadTarget});

                    resolve(response);
                }, 
                error: (error) => { 
                    this.sendError(format(ERROR_DOWNLOAD, url), error);
                    this.stopExecution = true;

                    resolve(error);
                }
            });
        });
    }

    onWorkerMessage = (e) => {
        if (e.data.error) {
            this.sendError(e.data.error);
        }

        if (e.data.progress) {
            this.sendProgress({ type: 'comparing', info: PROGRESS_COMPARING, percentage: e.data.progress});
        }

        if (e.data.done) {
            this.onWorkerDone(e.data);
        }
    }

    onWorkerDone = (data) => {
        this.itemsInfo = data.itemsInfo;
        this.setsAdded = data.setsAdded;
        this.libsAdded = data.libsAdded;
        this.newClothing = data.newClothing;

        var finalFiguredata = vkbeautify.xml(data.destFiguredata);
        var finalFiguremap = vkbeautify.xml(data.destFiguremap);
        var finalFurnidata = vkbeautify.xml(data.newFurnidata);

        var finalProductdata = [];

        var files = [];
        var downloadFiles = [];

        if (this.setsAdded === 0 && this.libsAdded === 0) {
            this.sendProgress({type: 'done', info: NO_CHANGES_TEXT });
            return;
        }

        for (let item of this.itemsInfo) {
            finalProductdata.push([item.classname, item.name, item.description]);
        }

        finalProductdata = JSON.stringify(finalProductdata);

        this.sendProgress({type: 'sql', info: PROGRESS_SQL });
        let queries = this.generateQueries();
        
        this.sendProgress({type: 'serializing', info: PROGRESS_SERIALIZING });
        files.push({ name: "figuremap.xml", content: finalFiguremap });
        files.push({ name: "figuredata.xml", content: finalFiguredata });
        files.push({ name: "furnidata_changes.xml", content: finalFurnidata });
        files.push({ name: 'README', content: README });
        files.push({ name: "productdata_changes.txt", content: finalProductdata });
        files.push({ name: "sql/items_base.sql", content: queries.items_base });
        files.push({ name: "sql/catalog_clothing.sql", content: queries.catalog_clothing });
        files.push({ name: "sql/catalog_items.sql", content: queries.catalog_items });

        this.files = files;

        this.summaryPrefix = format(MAIN_SUMMARY, this.setsAdded, this.libsAdded);
        this.summarySuffix = SUFFIX_SUMMARY_START;

        for (let furni of this.itemsInfo) {
            let variables = {revision: furni.revision, typeid: furni.classname, param: ''};

            let iconPath = this.externalVariables.getProperty("flash.dynamic.icon.download.name.template", variables, 'icons/%typeid%_icon.png');
            let swfPath = this.externalVariables.getProperty("flash.dynamic.download.name.template", variables, '%typeid%.swf');

            downloadFiles.push({ name: `icons/${furni.classname}_icon.png`, url: `${this.habboHofFurniUrl}${iconPath}`});
            downloadFiles.push({ name: `hof_furni/${furni.classname}.swf`, url: `${this.habboHofFurniUrl}${swfPath}`});
        }

        for (let clothing of this.newClothing) {
            let lineType = (clothing.set) ? SUFFIX_SUMMARY_CLOTHING_SET : SUFFIX_SUMMARY_CLOTHING;
            this.summarySuffix +=  format(lineType, clothing.lib, clothing.set);

            downloadFiles.push({ name: `production/${clothing.lib}.swf`, url: `${this.habboProductionUrl}${clothing.lib}.swf`});
        }

        if (this.options.isCustom) {
            let newFiles = [];
            for (let file of downloadFiles) {
                newFiles.push({ name: file.name, url: CORS_PROXY_URL + file.url });
            }
            downloadFiles = newFiles;
        }

        let downloadOptions = { 
            files: downloadFiles, 
            returnResult: true, 
            onProgress: this.handleDownloadsProgress, 
            onDone: this.handleDownloadsDone,
            resultName: 'figure.zip',

        }

        this.sendProgress({type: 'downloading', info: format(PROGRESS_DOWNLOADING, this.hotelUrl.host), percentage: 0 });
        this.fileDownloader = new FileDownloader(downloadOptions);
    }

    generateQueries = () => {
        if (this.itemsInfo.length === 0) {
            return { items_base: '', catalog_clothing: '', catalog_items: '' };
        }

        let itemsSql = ITEMS_BASE_SQL_MAIN;
        let catalogClothingSql = CATALOG_CLOTHING_SQL_MAIN;
        let catalogItemsSql = (!this.options.catalogPageId ? CATALOG_ITEMS_SQL_COMMENT : '') + CATALOG_ITEMS_SQL_MAIN;
        
        let pageId = (this.options.catalogPageId) ? this.options.catalogPageId : "{PAGE ID}";

        for (let i = 0; i < this.itemsInfo.length; i++) {
            let item = this.itemsInfo[i];

            let endCharacter = (i === this.itemsInfo.length - 1) ? ";" : ",";
            let itemId = (this.options.itemsBaseOffset) ? this.options.itemsBaseOffset + i : item.id;
            
            itemsSql += format(ITEMS_BASE_SQL_ROW, itemId, item.id, item.classname) + endCharacter;
            catalogClothingSql += format(CATALOG_CLOTHING_SQL_ROW, item.classname, item.setid.replace(/ /g, '')) + endCharacter;
            catalogItemsSql += format(CATALOG_ITEMS_SQL_ROW, pageId, itemId, item.classname) + endCharacter;
        }

        return {
            items_base: itemsSql,
            catalog_clothing: catalogClothingSql,
            catalog_items: catalogItemsSql
        }
    }
    
    handleDownloadsProgress = (progress) => {
        this.sendProgress({type: 'downloading', info: format(PROGRESS_DOWNLOADING, this.hotelUrl.host), percentage: progress});
    }

    handleDownloadsDone = (result) => {

        let shortSummary = format(SHORT_SUMMARY, result.successCount, result.errorCount, this.summaryPrefix);
        let errorSummary = "";

        for (let error of result.errorList) {
            errorSummary += format(ERROR_DOWNLOAD_SUMMARY, error);
        }

        for (let file of this.files) {
            result.zip.file(file.name, file.content);
        }

        result.zip.file('summary.txt', format(TOTAL_SUMMARY, shortSummary, errorSummary, this.summarySuffix));

        this.fileDownloader.zip = result.zip;
        this.fileDownloader.downloadZip();

        this.sendProgress({type: 'done', info: shortSummary });

    }
}

const CATALOG_ITEMS_SQL_COMMENT = "-- IMPORTANT: Replace {PAGE ID} with the desired catalog page\n",
      CATALOG_ITEMS_SQL_MAIN = "INSERT INTO `catalog_items` (`page_id`, `item_ids`, `offer_id`, `song_id`, `order_number`, `catalog_name`, `cost_credits`, `cost_points`, `points_type`, `amount`, `limited_sells`, `limited_stack`, `extradata`, `have_offer`, `club_only`) VALUES",
      CATALOG_ITEMS_SQL_ROW = "\n('{0}', '{1}', '-1', '0', '1', '{2}', '0', '0', '0', '1', '0', '0', '', '1', '0')",
      CATALOG_CLOTHING_SQL_MAIN = "INSERT INTO `catalog_clothing` (`name`, `setid`) VALUES ",
      CATALOG_CLOTHING_SQL_ROW = "\n('{0}', '{1}')",
      ITEMS_BASE_SQL_MAIN = "INSERT INTO `items_base` (`id`, `sprite_id`, `item_name`, `public_name`, `width`, `length`, `stack_height`, `allow_stack`, `allow_sit`, `allow_lay`, `allow_walk`, `allow_gift`, `allow_trade`, `allow_recycle`, `allow_marketplace_sell`, `allow_inventory_stack`, `type`, `interaction_type`, `interaction_modes_count`, `vending_ids`, `multiheight`, `customparams`, `effect_id_male`, `effect_id_female`) VALUES ",
      ITEMS_BASE_SQL_ROW = "\n('{0}', '{1}', '{2}', '{2}', '1', '1', '0.00', '1', '0', '0', '0', '1', '1', '0', '1', '1', 's', 'clothing', '1', '0', '0', '', '0', '0')",
      NO_CHANGES_TEXT = "You are fully up to date!\nNo changes were made.",
      MAIN_SUMMARY = "Added {0} new clothing sets and {1} new clothing parts.",
      SUFFIX_SUMMARY_START = "New clothing:",
      SUFFIX_SUMMARY_CLOTHING_SET = "\r\n - {0} ({1})",
      SUFFIX_SUMMARY_CLOTHING = "\r\n - {0}",
      PROGRESS_INIT = 'Downloading and parsing files',
      PROGRESS_COMPARING = 'Finding and adding new clothes',
      PROGRESS_SQL = 'Generating SQL queries',
      PROGRESS_SERIALIZING = 'Serializing files',
      PROGRESS_DOWNLOADING = 'Downloading files from {0}',
      ERROR_EXTERNAL_VARIABLE_INVALID = "The external variable file does not have a valid value for {0}.",
      ERROR_DOWNLOAD = 'An error occured while trying to download {0}',
      ERROR_NECESSARY_FILE = 'An error occured while downloading a necessary file. Please try again!',
      ERROR_DOWNLOAD_SUMMARY = 'Failed to download {0}\r\n',
      SHORT_SUMMARY = "Downloaded {0} files successfuly, and failed on {1} files.\r\n{2}",
      TOTAL_SUMMARY = "{0}\r\n\r\n{1}\r\n{2}";

const README = `BASIC TUTORIAL
-------------------------------------------------------------
Backup your database and files before making any changes, just in case.

Within the zip file there is a several folders and files to add.
 - hof_furni: Needs to be added to your hof_furni folder
 - icons: Needs to be added to your the folder you have your icons in
 - production: Needs to be added to your production-[string] folder

Your figuredata and figuremap should be replaced and the SQLs should be ran.
Copy the contents from furnidata_changes.xml into your furnidata.xml inside a <roomitemtypes> tag.

Optionally copy the contents from productdata_changes.txt into your productdata.txt, making sure that the previous group ends with a comma.
This step isn't strictly necessary, and if you do it incorrectly it could result in errors, so make sure to backup your productdata first.

If you have any problems, please contact us on the Krews Discord server.

-------------------------------------------------------------
This zip folder was generated by HabboTools (Made by Theodor)
Krews Discord: https://discord.gg/rEwmSkp`.replace(/\n/g, "\r\n");