import { IMAGES_BASE_URL } from "../utils/config.js";
import { saveDataJson } from "./saveDataJson.js";
import { $translate, language } from "./translations.js";
import { state } from "./main.js";

const isSticker = (item) => {
    if (item.sticker_material === undefined) {
        return false;
    }

    if (!item.item_name.startsWith("#StickerKit_")) {
        return false;
    }

    if (item.name.includes("graffiti")) {
        return false;
    }

    if (item.name.includes("spray_")) {
        return false;
    }

    return true;
};

const parseItem = (item) => {
    const image = `${IMAGES_BASE_URL}econ/stickers/${item.sticker_material.toLowerCase()}_large.png`;

    return {
        id: `sticker-${item.object_id}`,
        name: `Sticker | ${$translate(item.item_name)}`,
        description: $translate(item.description_string),
        rarity: $translate(`rarity_${item.item_rarity}`),
        image,
    };
};

export const getStickers = () => {
    const { stickerKits } = state;
    const stickers = [];

    stickerKits.forEach((item) => {
        if (isSticker(item)) stickers.push(parseItem(item));
    });

    saveDataJson(`./public/api/${language}/stickers.json`, stickers);
};
