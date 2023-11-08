import { defineStore } from 'pinia'
import axios from "axios"

import { ComponentSize } from '../types';


export const useExampleStore = defineStore('exampleWithInteractions', {
    state: () => ({
        size: { width: 0, height: 0 } as ComponentSize,
        isDataReady: false,
        receivedData: null,
    }),
    getters: {
        resize: (state) => {
            return state.size
        }
    },
    actions: {
        // POST request but in slightly different syntax when it's declared as a method in a component or an action in the store.
        /* This requires an existing API to exist */
        async fetchExample(method: string) { 
            axios.post(`<some-API-endpoint>`, {method: method})
                .then(resp => {
                    this.receivedData = resp.data;
                    this.isDataReady = true;
                    return true;
                })
                .catch(error => console.log(error));
        },
    }
})