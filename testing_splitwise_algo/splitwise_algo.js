
function initializeDict(keysArray) {
    const dict = Object.fromEntries(keysArray.map(key => [key, 0]));
    return dict;
}

function naiveRound(num, decimalPlaces = 0) {
    var p = Math.pow(10, decimalPlaces);
    return Math.round(num * p) / p;
}
function recurseForMinTran(positives, negatives, transactionRecords){
    if(positives.length + negatives.length === 0) return 0
    const from = negatives[0][0]
    const negative = negatives[0][1]
    let minCount = Infinity
    let bestTransactions = []
    for(const positive of positives){
        const pos = positive[1]
        const key = positive[0]
        let new_positives = positives.slice()
        let new_negatives = negatives.slice()
        let f, t, a
        let positiveIndex = -1;
        for (let i = 0; i < new_positives.length; i++) {
            if (new_positives[i][0] === key && new_positives[i][1] === pos) {
                positiveIndex = i;
                break;
            }
        }
        if (positiveIndex !== -1) {
            new_positives.splice(positiveIndex, 1);
        }

        let negativeIndex = -1;
        for (let i = 0; i < new_negatives.length; i++) {
            if (new_negatives[i][0] === from && new_negatives[i][1] === negative) {
                negativeIndex = i;
                break;
            }
        }
        if (negativeIndex !== -1) {
            new_negatives.splice(negativeIndex, 1);
        }

        f = key
        t = from
        const amount = naiveRound(pos+negative , 2)
        if(pos === (-1*negative)){
            a = pos
        }
        else if(pos > (negative*-1)){
            new_positives.push([key,amount])
            a = negative*-1
        }else{
            new_negatives.push([from,amount])
            a = pos
        }

        let currentTransactions = [[f, t, a]]
        let currentTransactionRecords = [...transactionRecords, ...currentTransactions]
        let count =  1 + recurseForMinTran(new_positives, new_negatives, transactionRecords)

        if (count < minCount) {
            minCount = count;
            bestTransactions = currentTransactionRecords;
        }
    }
    transactionRecords.length = 0; 
    transactionRecords.add(...bestTransactions); 
    return minCount 
}
function splitwise(transactions, members){ 
    const dict = initializeDict(members);
    console.log("splitwise " + dict + transactions)
    for(const transaction of transactions){
        dict[transaction[0]]-=transaction[2]
        dict[transaction[1]]+=transaction[2]

        dict[transaction[0]] = naiveRound(dict[transaction[0]], 2)
        dict[transaction[1]] = naiveRound(dict[transaction[1]], 2)
    }

    const entries = Object.entries(dict);

    const positives = entries.filter(([key, value]) => value > 0);
    const negatives = entries.filter(([key, value]) => value < 0);

    console.log("Positives:", positives);
    console.log("Negatives:", negatives);

    let transactionRecords = new Set()

    const minTransactionNumber = recurseForMinTran(positives, negatives, transactionRecords)
    console.log(minTransactionNumber)
    console.log(transactionRecords)
    return transactionRecords
}



export {splitwise}

