import { z } from 'zod';

export const allowedSettingKeys = [
    'currencies',
    'baseCurrency',
    'tags',
    'groups',
    'username',
    'name',
    'image',
    'profilePic',
];

const arraySettingKeys = ['currencies', 'tags', 'groups'];

const settingValueSchema = z.union([z.string(), z.array(z.string())]);

export const updateSettingSchema = z.object({
    key: z.enum(allowedSettingKeys),
    setting: settingValueSchema,
});

export const addSettingSchema = z.object({
    key: z.enum(arraySettingKeys),
    setting: settingValueSchema,
});

export const removeSettingSchema = z.object({
    key: z.enum(arraySettingKeys),
    setting: settingValueSchema,
});
