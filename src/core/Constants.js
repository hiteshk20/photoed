/**
 * Core constants for the graphics engine.
 * Using Object.freeze to ensure these act as true enums.
 */

export const LayerType = Object.freeze({
    RASTER: 'raster',
    VECTOR: 'vector',
    TEXT: 'text',
    GROUP: 'group'
});

export const BlendMode = Object.freeze({
    NORMAL: 'normal',
    MULTIPLY: 'multiply',
    SCREEN: 'screen',
    OVERLAY: 'overlay',
    DARKEN: 'darken',
    LIGHTEN: 'lighten',
    COLOR_DODGE: 'color-dodge',
    COLOR_BURN: 'color-burn',
    HARD_LIGHT: 'hard-light',
    SOFT_LIGHT: 'soft-light',
    DIFFERENCE: 'difference',
    EXCLUSION: 'exclusion'
});

export const DefaultSettings = Object.freeze({
    CANVAS_WIDTH: 1920,
    CANVAS_HEIGHT: 1080,
    DEFAULT_OPACITY: 1.0,
    DEFAULT_BLEND_MODE: BlendMode.NORMAL
});
