import { VendorCampaignStudio } from '@/features/vendor/studios';
export default async function VendorStoriesPage({searchParams}:{searchParams:Promise<{edit?:string}>}){const{edit}=await searchParams;return <VendorCampaignStudio type="STORY" editId={edit}/>}
