function getCurrentTime(): string {
    const date = new Date();
    const year = date.getFullYear().toString();
    const month = date.getMonth().toString();
    const day = date.getDay().toString();
    const hours = date.getHours().toString();
    const minutes = date.getMinutes().toString();
    const seconds = date.getSeconds().toString();
    // return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    return `${hours}:${minutes}:${seconds}`;
}


export {
    getCurrentTime
}



