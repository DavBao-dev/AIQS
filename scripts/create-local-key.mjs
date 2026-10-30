import {generateKeyPairSync,randomBytes} from 'node:crypto';
import {mkdirSync,writeFileSync,existsSync} from 'node:fs';
const dir=new URL('../.secrets/',import.meta.url);mkdirSync(dir,{recursive:true});
const path=new URL('service-account.json',dir);if(existsSync(path))throw Error('Existing key preserved');
const {privateKey}=generateKeyPairSync('rsa',{modulusLength:2048,privateKeyEncoding:{type:'pkcs8',format:'pem'},publicKeyEncoding:{type:'spki',format:'pem'}});
writeFileSync(new URL('private.pem',dir),privateKey,{mode:0o600});
writeFileSync(path,JSON.stringify({type:'service_account',project_id:'aiqs-506010',private_key:privateKey,client_email:'aiqs-650@aiqs-506010.iam.gserviceaccount.com',token_uri:'https://oauth2.googleapis.com/token'}),{mode:0o600});
writeFileSync(new URL('../.env',import.meta.url),'GOOGLE_APPLICATION_CREDENTIALS=.secrets/service-account.json\nSHEET_ACCESS_TOKEN='+randomBytes(32).toString('hex')+'\n',{mode:0o600});
console.log('Private credentials stored in ignored .secrets and .env.');
