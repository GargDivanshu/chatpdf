import {getKindeServerSession} from '@kinde-oss/kinde-auth-nextjs/server'
import {redirect} from 'next/navigation'

const Page = async () => {
     const {getUser} = getKindeServerSession()
     const user = await getUser()

     console.log(user.id + " " + user.email)
     if(!user || !user.id) redirect('/auth-callback?origin=dashboard')
    return (
        <div>
        <div>
            HellWorld, {user.email}
        </div>
        </div>
    )
}

export default Page; 