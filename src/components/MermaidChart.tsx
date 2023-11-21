export default function generateMermaidChart(utterances: any[], dialogs: any[], services: any[]) {

    let diagram = 'graph LR\n';
    let utteranceCounter = 0;
    let nodeSet = new Set(); // Set to track created nodes

    // Function to create a safe ID by replacing spaces
    const createSafeId = (prefix: any, key: any) => `${prefix}_${key.replace(/\s+/g, '_')}`;

    // Construct diagram string for utterances and dialogs
    utterances.forEach(utterance => {
        if (utterance.dialogKey) {
            const utteranceId = `Utterance_${utteranceCounter++}`;
            const dialogId = createSafeId('Dialog', utterance.dialogKey);

            // Add utterance node
            diagram += `${utteranceId}["${utterance.utterance}"]\n`;

            // Add dialog node if not already added
            if (!nodeSet.has(dialogId)) {
                diagram += `${dialogId}{{"${utterance.dialogKey}"}}\n`;
                nodeSet.add(dialogId);
            }

            // Connect utterance to dialog
            diagram += `${utteranceId} -.-> ${dialogId}\n`;
        }
    });

    // Construct diagram string for dialogs and services
    dialogs.forEach(dialog => {
        const dialogId = createSafeId('Dialog', dialog.dialogKey);
        const service = services.find(s => s.name === dialog.serviceKey);
        if (service) {
            const serviceId = createSafeId('Service', service.name);
            const serviceProperties = (service.isTransactional ? '\n(Transaccional)' : '') + (service.isAnalysisNeeded ? '\n(Requiere Operación)' : '') + (service.isInformational ? '\n(Solo Informativo)' : '');

            // Add service node if not already added
            if (!nodeSet.has(serviceId)) {
                diagram += `${serviceId}(("${service.name + serviceProperties}"))\n`;
                nodeSet.add(serviceId);
            }

            // Connect dialog to service
            if (nodeSet.has(dialogId)) { // Ensure dialog node exists
                diagram += `${dialogId} --> ${serviceId}\n`;
            }
        }
    });

    // Log the final diagram string
    console.log('Mermaid Diagram:', diagram);

    // Create a new mermaid div
    const mermaidDiv = document.createElement('div');
    mermaidDiv.className = 'mermaid';
    mermaidDiv.innerHTML = diagram;

    return (diagram);
}
