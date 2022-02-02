const kafka = {
    clientId: "rally-event-publisher",
    brokers: [process.env.BOOTSTRAP_BROKER || "localhost:2001"],
    ssl: process.env.KAFKA_SSL ? JSON.parse(process.env.KAFKA_SSL) : false,
    sasl:
        process.env.KAFKA_USERNAME && process.env.KAFKA_PASSWORD
            ? {
                username: process.env.KAFKA_USERNAME,
                password: process.env.KAFKA_PASSWORD,
                mechanism: 'plain'
            }
            : null,
};

const consumer = {
    groupId: process.env.KAFKA_GROUP_ID || "rally-event-publisher",
    topic: "alm-object-change-notification-alm-5"
};


module.exports = {
    kafka,
    consumer
};