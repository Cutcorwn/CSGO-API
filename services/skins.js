import { IMAGES_BASE_URL } from "../utils/config.js";
import { getWeaponName } from "../utils/weapons.js";
import { saveDataJson } from "./saveDataJson.js";
import { getTranslation } from "./translations.js";

const getSkinsCollections = (itemSets, translations) => {
    const result = {};

    itemSets.forEach((item) => {
        if (item.is_collection) {
            const keys = Object.keys(item.items).map((item) => {
                const pattern = item.match(/\[(.*?)\]/i);

                if (pattern) {
                    return pattern[1];
                }

                return item;
            });

            keys.forEach((key) => {
                result[key.toLocaleLowerCase()] = {
                    id: item.name.replace("#CSGO_", ""),
                    name: getTranslation(translations, item.name),
                };
            });
        }
    });

    return result;
};

const getPatternName = (weapon, string) => {
    return string
        .replace(`${weapon}_`, "")
        .replace("silencer_", "")
        .toLowerCase();
};

const isSkin = (iconPath) => {
    const regexSkinId = /econ\/default_generated\/(.*?)_light$/i;

    return regexSkinId.test(iconPath.toLowerCase());
};

const getSkinInfo = (iconPath) => {
    const regexSkinId = /econ\/default_generated\/(.*?)_light$/i;
    const path = iconPath.toLowerCase();
    const skinId = path.match(regexSkinId);
    
    const weapon = getWeaponName(skinId[1]);
    const pattern = getPatternName(weapon, skinId[1]);

    return [weapon, pattern];
};

const parseItem = (
    item,
    items,
    skinsCollections,
    paintKits,
    paintKitsRarity,
    translations
) => {
    const [weapon, pattern] = getSkinInfo(item.icon_path);
    const image = `${IMAGES_BASE_URL}${item.icon_path.toLowerCase()}_large.png`;
    const translatedName = items[weapon].translation_name;

    return {
        id: `${weapon}_${pattern}`,
        collection_id: skinsCollections[pattern]?.id ?? null,
        name: `${translatedName} | ${paintKits[pattern].description_tag}`,
        weapon: translatedName,
        pattern:paintKits[pattern].description_tag ?? null,
        min_float: paintKits[pattern].wear_remap_min,
        max_float: paintKits[pattern].wear_remap_max,
        rarity:
            getTranslation(
                translations,
                `rarity_${paintKitsRarity[pattern]}_weapon`
            ) ?? "Contraband",
        image,
    };
};

export const getSkins = (
    itemsGame,
    items,
    paintKits,
    itemSets,
    paintKitsRarity,
    translations
) => {
    const skinsCollections = getSkinsCollections(itemSets, translations);
    const skins = [];

    Object.values(itemsGame.alternate_icons2.weapon_icons).forEach((item) => {
        if (isSkin(item.icon_path))
            skins.push(
                parseItem(
                    item,
                    items,
                    skinsCollections,
                    paintKits,
                    paintKitsRarity,
                    translations
                )
            );
    });

    saveDataJson(`./public/api/skins.json`, skins);
};