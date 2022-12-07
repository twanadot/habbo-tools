import JSZip from 'jszip';
import FileSaver from 'file-saver';
import JSZipUtils from 'jszip-utils/dist/jszip-utils';

class FileDownloader {
    files = []

    count = 0;
    errors = 0;

    errorList = [];

    returnResult = false;

    constructor(options) {
        this.zip = new JSZip();
        this.files = options.files;

        this.zipFilename = options.resultName || 'downloads.zip';

        this.progressCallback = options.onProgress;
        this.doneCallback = options.onDone;

        this.returnResult = options.returnResult || false;

        if (this.files && typeof(this.files) === 'object') {
            this.start();
        }
    }

    start = () => {
        this.totalFiles = this.files.length;

        for (let file of this.files) {
            this.downloadFile(file).then(this.handleSuccess).catch(this.handleError);
        }

        if (this.files.length === 0) {
            this.done();
        }
    }

    downloadFile = (file) => {
        return new Promise((resolve, reject) => 
        {
            JSZipUtils.getBinaryContent(file.url, (error, data) => 
            {
                if(error) 
                {
                    reject({ file: file, url: file.url, error: error});
                } else {
                    resolve({ file: file, url: file.url, data: data });
                }
            });
        });
    }

    handleSuccess = (response) => {
        this.zip.file(response.file.name, response.data, {binary:true});
        
        this.handleBoth();
    }

    handleError = (response) => {
        this.errors++;
        this.errorList.push(response.url);

        this.handleBoth();
    }

    handleBoth = () => {
        this.count++;

        if (this.progressCallback) {
            this.progressCallback(this.count / this.totalFiles);
        }

        if (this.count === this.totalFiles) {
            this.done();
        }
    }
    
    done = () => {
        let result = {
            totalCount: this.count,
            successCount: this.count - this.errors,
            errorCount: this.errors,
            errorList: this.errorList,
            zip: this.zip
        }

        if (!this.returnResult) {
            this.downloadZip();
        }
        
        if (this.doneCallback) {
            this.doneCallback(result);
        }
    }

    downloadZip = () => {
        this.zip.generateAsync({type:"blob"}).then((blob) => {
            FileSaver.saveAs(blob, this.zipFilename);
        });
    }
}

export default FileDownloader;