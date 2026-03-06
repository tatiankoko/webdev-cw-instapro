/**
 * Замена критичных символов в строке
 * @param {string} inputString текст ввода
 * @returns {string} текст ввода с измененными символами
 */
export const htmlTagsConverter = (inputString) => {
    return inputString
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
}