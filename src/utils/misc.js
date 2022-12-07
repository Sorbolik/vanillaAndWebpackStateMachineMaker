export function composeTemplate(html, css) {
    let template = document.createElement('template');
    template.innerHTML = `
        ${css ? `<style>${css}</style>` : ''}
        ${html ? html : ''}
    `
    return template;
}

export async function fetchFromFile(baseUrl, relativeUrl) {
    const finalUrl = new URL(relativeUrl, baseUrl).href;
    let response = await fetch(finalUrl);
    if (response.ok) {
        return response.text();
    }
    throw response.json();
}