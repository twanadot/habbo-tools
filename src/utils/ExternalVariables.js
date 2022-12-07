
export default class ExternalVariables {

    dictionary = {};
    protocol = 'http:';

    constructor(text, url) {
        this.rawText = text.replace(/\r\n/g, '\n');

        if (url) {
            this.dictionary["url.prefix"] = url.origin;
            this.protocol = url.protocol;
        }
            

        let lines = this.rawText.split('\n');

        // Generate dictionary
        for (let line of lines) {
            if (line.indexOf('=') === -1) 
                continue;

            let key = line.substring(0, line.indexOf('='));
            let value = line.substring(line.indexOf('=') + 1);

            this.dictionary[key] = value;
        }

        // Replace ${key} values with the corresponding value
        for (let key in this.dictionary) {
            this.dictionary[key] = this.dictionary[key].replace(/\${(.*?)}/g, (match, replaceKey) => {
                return typeof this.dictionary[replaceKey] != 'undefined'
                    ? this.dictionary[replaceKey]
                    : match
                ;
            })
        }
    }

    getProperty(key, variables, defaultValue) {
        let value = this.dictionary[key];

        if (!value) {
            value = defaultValue || null;
        }

        if (variables && value) {
            for (let variable in variables) {
                value = value.replace(new RegExp(`%${this.escapeString(variable)}%`, 'g'), variables[variable] )
            }
        }

        return value;
    }

    getUrl(key) {
        let value = this.getProperty(key);

        if (value !== null && value.substring(0,4) !== 'http')
            value = this.protocol + value;

        return value;
    }

    escapeString = (string) => {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
}