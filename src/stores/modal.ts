import { defineStore } from "pinia";

export const useModalStore = defineStore(
    "modal",
    {
        state: () => ({
            isOpen: false,
        }),
        actions: {
            openModal(v: boolean) {
                this.isOpen = v;
            },
        },
    }
);

