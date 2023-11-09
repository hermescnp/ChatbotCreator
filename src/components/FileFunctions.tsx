import React from "react";

export const UploadFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const file = event.target.files?.[0];
  
    if (file) {
      fileReader.readAsText(file, "UTF-8");
      fileReader.onload = e => {
        const content = e.target?.result;
        if (typeof content === 'string') {
          const data = JSON.parse(content);
          const prompts : any = [];
          const ideas : any = [];
          const services : any = [];
          
          data.forEach((item : any) => {
            switch (item.objectType) {
              case 'prompt':
                prompts.push(item);
                break;
              case 'idea':
                ideas.push(item);
                break;
              case 'service':
                services.push(item);
                break;
              default:
                // Handle unknown types or log an error
            }
          });
          return [prompts, ideas, services];
        }
      };
    }
  };