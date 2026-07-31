import { VendorCampaignStudio } from '@/features/vendor/studios';
export default async function VendorReelsPage({searchParams}:{searchParams:Promise<{edit?:string}>}){const{edit}=await searchParams;return <VendorCampaignStudio type="REEL" editId={edit}/>}
