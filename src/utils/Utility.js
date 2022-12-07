// This should be built into JavaScript, but it isn't, and apparently adding it properly (string prototype) is an anti-pattern.
function format(string) {
    var args = arguments;
    return string.replace(/{(\d+)}/g, function(match, number) { 
        let index = Number(number) + 1;
        return typeof args[index] != 'undefined'
            ? args[index]
            : match
        ;
    });
};

export { format };

export default {
    format: format
}