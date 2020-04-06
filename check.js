const config = require('./codes.json');


config.airauto17.forEach((e, i) => {
    if (config.airauto18[i] !== e || config.airauto19[i] !== e || config.airauto20[i] !== e || config.airauto21[i] !== e) {
        console.log(`INDEX ${i}\t17: ${e}  \t18: ${config.airauto18[i]}  \t19: ${config.airauto19[i]}  \t 20: ${config.airauto20[i]} \t 21: ${config.airauto21[i]}`)
    }
})