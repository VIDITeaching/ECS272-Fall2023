export function groupBy(objectArray, property) {
    return objectArray.reduce(function (acc, obj) {
        let key = obj[property]
        if (!acc[key]) {
            acc[key] = []
        }
        acc[key].push(obj)
        return acc
    }, {})
}

export function escapeCSS(str) {
    return str.replaceAll(" ", "-").replaceAll("&", "-")
}

export function shorten(str, max = 10) {

    if (str.length > max - 3) {
        return str.slice(0, max - 3) + "..."
    }
    return str
}