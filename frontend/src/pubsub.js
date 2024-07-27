// src/pubsub.js
import PubSub from 'pubsub-js';

const PUBSUB = {
    publish: (topic, message) => PubSub.publish(topic, message),
    subscribe: (topic, callback) => PubSub.subscribe(topic, callback),
    unsubscribe: (token) => PubSub.unsubscribe(token),
};

export default PUBSUB;
