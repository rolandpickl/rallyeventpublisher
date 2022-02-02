const avro = require('avsc')
const registry = require('avro-schema-registry')('http://localhost:2002')

module.exports = async ({ kafka, config, io }) => {
    const consumer = kafka.consumer(config.consumer);

    await consumer.connect();
    await consumer.subscribe({ topic: config.consumer.topic, fromBeginning: false });

    await consumer.run({
        eachMessage: async ({ message }) => {
            const value = await registry.decode(Buffer.from(message.value,0, message.value.length));
            const flowStateObj = getObjects(value, "name", "FlowState");
            const nameObj = getObjects(value, "name", "Name");
            const formattedIdObj = getObjects(value, "name", "FormattedID");
            if (!(formattedIdObj[0] === undefined) && !(flowStateObj === undefined) && flowStateObj.length === 2) {
                io.emit('notification', {notification: formattedIdObj[0].value.string + ": " + nameObj[0].value.string + ": the flow state has changed from "
                    + flowStateObj[0].old_value.map.name.string + " to " + flowStateObj[0].value.map.name.string});
            }
        },
    });

    return consumer;
};

//return an array of objects according to key, value, or key and value matching
function getObjects(obj, key, val) {
    var objects = [];
    for (var i in obj) {
        if (!obj.hasOwnProperty(i)) continue;
        if (typeof obj[i] == 'object') {
            objects = objects.concat(getObjects(obj[i], key, val));
        } else
            //if key matches and value matches or if key matches and value is not passed (eliminating the case where key matches but passed value does not)
        if (i == key && obj[i] == val || i == key && val == '') { //
            objects.push(obj);
        } else if (obj[i] == val && key == ''){
            //only add if the object is not already in the array
            if (objects.lastIndexOf(obj) == -1){
                objects.push(obj);
            }
        }
    }
    return objects;
}

//return an array of values that match on a certain key
function getValues(obj, key) {
    var objects = [];
    for (var i in obj) {
        if (!obj.hasOwnProperty(i)) continue;
        if (typeof obj[i] == 'object') {
            objects = objects.concat(getValues(obj[i], key));
        } else if (i == key) {
            objects.push(obj[i]);
        }
    }
    return objects;
}

//return an array of keys that match on a certain value
function getKeys(obj, val) {
    var objects = [];
    for (var i in obj) {
        if (!obj.hasOwnProperty(i)) continue;
        if (typeof obj[i] == 'object') {
            objects = objects.concat(getKeys(obj[i], val));
        } else if (obj[i] == val) {
            objects.push(i);
        }
    }
    return objects;
}
