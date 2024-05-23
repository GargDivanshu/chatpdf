'use client'

import { PropsWithChildren, useState } from "react"
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import { trpc } from "../_trpc/client"
import { httpBatchLink } from "@trpc/client"


const Providers = ({children}: PropsWithChildren) => {

    const [queryClient] = useState(() => new QueryClient())
    const [trpcClient] = useState(() => trpc.createClient({
        links: [
            httpBatchLink({
                url: `${process.env.KINDE_SITE_URL}/api/trpc`,
                // https://9000-idx-chatpdf-1716143585263.cluster-3g4scxt2njdd6uovkqyfcabgo6.cloudworkstations.dev/auth-callback?origin=dashboard
            }),
        ],
    }))

    return (
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </trpc.Provider>
    )
}

export default Providers