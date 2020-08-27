import { 
    initializeBlock,
    useBase,
    useRecords,
} from '@airtable/blocks/ui';
import sanityClient from '@sanity/client';
import React from 'react';



function App() {
    const base = useBase();
    const quoteTable = base.getTableByName('quote');
    const quoteRecords = useRecords(quoteTable);
    quoteRecords.map(r => console.log(r.getCellValue('day')))
    const dayOptions = quoteRecords.map(r => r.getCellValue('day')).filter((v,i,a)=>a.findIndex(t=>(t.id === v.id))===i)
    console.log(dayOptions)

    const client = sanityClient({
        projectId: 'hhd5q8cp',
        dataset: 'production',
        token: '', // or leave blank to be anonymous user
        useCdn: false // `false` if you want to ensure fresh data
    })
    
    const categoryTable = base.getTableByName('category')
    const categoryRecords = useRecords(categoryTable)
    const categoryQuery =  (sanityId) => categoryRecords.filter(record => record.getCellValueAsString('sanityId') === sanityId);
    
    const query = '*[_type == "quote"]'
    
    const subscription = client.listen(query)
    .subscribe(data => {
        console.log(data)
        console.log(data.transition)
        const quote = data.result
        console.log(quote)
            let sanityDoc = data.result
            let primary = {}
            if (sanityDoc.primary){
                const record = categoryQuery(sanityDoc.primary._ref)
                primary.id = record[0].id
                primary.name = record[0].name
            }

            let secondary = {}
            if (sanityDoc.secondary){
                const record = categoryQuery(sanityDoc.primary._ref)
                secondary.id = record[0].id
                secondary.name = record[0].name
            }

            let qualifying = {}
            if (sanityDoc.qualifying){
                const record = categoryQuery(sanityDoc.primary._ref)
                qualifying.id = record[0].id
                qualifying.name = record[0].name
            }

            let day = {}
            if (sanityDoc.day){
                day = dayOptions.filter((d) => d.name === sanityDoc.day)[0]
            }
            console.log(day)


            let newOrUpdatedRecord = {
                'sanityId': sanityDoc._id,
                'airtableId': sanityDoc.airtableId || null,
                'published': true,
                'Exclude from Sanity': false,
                'text': sanityDoc.text || null,
                'source': sanityDoc.source  || null,
                'day': day,
                'youtube': sanityDoc.youtube || null,
                'shortLink': sanityDoc.shortLink || null,
                'dropbox': sanityDoc.dropbox || null,
                'primary': [primary],
                'secondary': [secondary],
                'qualifying': [qualifying],
            }
        

            const removeEmpty = obj => 
            Object.fromEntries(
              Object.entries(obj)
              .filter(([k, v]) => v !== null)
              .map(([k, v]) => (typeof v === "object" ? [k, removeEmpty(v)] : [k, v]))
              .filter(([k, v]) => Object.keys(v).length !== 0)
            );            

            console.log(newOrUpdatedRecord)

          const cleanedRecord = removeEmpty(newOrUpdatedRecord)

            console.log(cleanedRecord)
            
            switch (data.transition) {
                case "appear":
                    // table.createRecordAsync(newOrUpdatedRecord);
                    
                    break;

                case "disappear":
                
                    break;

                case "update": {
                    const id = sanityDoc.airtableId.split('-')[2]
                    quoteTable.updateRecordsAsync([
                        {id, fields: cleanedRecord},
                    ])
                
                    break;
                }

                default:
                    break;
            }
    })

    // let url = "https://hhd5q8cp.api.sanity.io/v1/data/listen/production?query=*[_type == 'quote']";
    // fetch(url, {
    //     method: "GET",
    //     // headers: {
    //     // //   "Authorization": "Bearer " + "skCGs2ZAU36V7b2pHd4YVPeIejfBHgEJQRsUUXOaAmg2YfQh0h5nWzJzrL9LBLwXuqlFGAk5vRofr1kDGL7Dp9HPFeWakjTHNTSsvOzuaGaldT8qAp2U0PD96mSusgLJLMe4SPcc7hC11eyBYW8WlxcDluavQ8L5w5DajBnho4QJ7NNG6Qdg",
    //     //   "Content-Type": "application/json",
    //     // },
    //   })
    //   .then(response => response.json())
    //   .then(result => {
    //     console.log(result)
    //   })
    //   .catch(error => console.error(error))

    return <div>Hello world 🚀</div>;
}

initializeBlock(() => <App />);
