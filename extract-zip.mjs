import AdmZip from 'adm-zip';

const backendZip = new AdmZip('attached_assets/backend-main (2)_1759584179414.zip');
backendZip.extractAllTo('attached_assets/backend-review/', true);

const frontendZip = new AdmZip('attached_assets/carfin-clean_1759584174129.zip');
frontendZip.extractAllTo('attached_assets/frontend-review/', true);

console.log('✅ ZIP files extracted successfully');
