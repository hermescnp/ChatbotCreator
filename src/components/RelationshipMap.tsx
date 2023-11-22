"use client"
import React, { useEffect, useRef, useState } from 'react'
import type { default as MermaidType } from 'mermaid'
import generateMermaidChart from './MermaidChart'

interface RelationshipMapProps {
    utterances: any[];
    dialogs: any[];
    services: any[];
}

export const RelationshipMap: React.FC<RelationshipMapProps> = ({ utterances, dialogs, services }) => {
    const mermaidRef = useRef<HTMLDivElement>(null);
    const defaultDiagram = "flowchart LR\nAgf[utterance] -->|?| Bgf(dialogKey)\nBgf[dialogKey] --> C(Service)"
    const [mermaid, setMermaid] = useState<typeof MermaidType | null>(null);

    const mermaidHTML = `
    <html>
    <head>
      <script src="https://unpkg.com/mermaid/dist/mermaid.min.js"></script>
      <script>
        mermaid.initialize({ startOnLoad: true });
      </script>
    </head>
    <body>
      <div class="mermaid"> 
      ${generateMermaidChart(utterances, dialogs, services)}
      </div>
    </body>
    </html>
  `;

    useEffect(() => {
        if (typeof window !== "undefined") {
            import('mermaid').then((m) => {
                setMermaid(m.default);
                m.default.initialize({ startOnLoad: true, theme: 'default' });
            });
        }
    }, []);

    useEffect(() => {
        if (mermaid && mermaidRef.current) {
            let diagram = 'graph LR\n';
            let utteranceCounter = 0;
            let dialogCounter = 0;

            // Construct diagram string for utterances and dialogs
            utterances.forEach(utterance => {
                if (utterance.dialogKey) {
                    const utteranceId = `Utterance_${utteranceCounter++}`;
                    const dialogId = `Dialog_${dialogCounter++}`;
                    diagram += `${utteranceId}["${utterance.utterance}"] --> ${dialogId}\n`;
                }
            });

            // Reset dialog counter for dialog to service mapping
            dialogCounter = 0;

            // Construct diagram string for dialogs and services
            dialogs.forEach(dialog => {
                const dialogId = `Dialog_${dialogCounter++}`;
                const service = services.find(s => s.name === dialog.serviceKey);
                if (service) {
                    const serviceId = `Service_${service.name.replace(/\s/g, '_')}`;
                    diagram += `${dialogId} --> ${serviceId}["${service.name}"]\n`;
                }
            });

            // Log the final diagram string
            console.log('Mermaid Diagram:', diagram);

            // Create a new mermaid div
            const mermaidDiv = document.createElement('div');
            mermaidDiv.className = 'mermaid';
            mermaidDiv.innerHTML = diagram;

            // Clear existing content and append new diagram
            mermaidRef.current.innerHTML = '';
            mermaidRef.current.appendChild(mermaidDiv);

            try {
                mermaid.contentLoaded();
            } catch (error) {
                console.error('Mermaid rendering error:', error);
            }
        }
    }, [mermaid, utterances, dialogs, services]);


    // Convert the HTML string to a Blob URL
  const blob = new Blob([mermaidHTML], { type: 'text/html' });
  const url = URL.createObjectURL(blob);

  return <iframe src={url} style={{ width: '100%', height: '100%', border: 'none' }} />;

};