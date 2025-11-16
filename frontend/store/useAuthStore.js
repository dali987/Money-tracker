import { create } from "zustand"
import { axiosInstance } from "@/lib/axios.js"

export const useAuthStore = create((set, get) =>({
    authUser: null,
    isCheckingAuth: false,
    isSigningUp: false,
    isLoggingIn: false,
    token: null,

    getToken: async () => {
        if (get().token) return get().token

        try{
            
            const res = await axiosInstance.get("/auth/token", {withCredentials: true})
            if (!res) throw new Error("error getting token")

            const accessToken = res?.data?.data

            if (!accessToken) throw new Error("error getting token")

            set({ token: accessToken })

            return accessToken

        }
        catch (error) {
            console.error("An error occurred while getting token: ", error)
            set({ token: null })
            return null
        }

    },

    checkAuth: async () =>{
        console.log("checking auth: ", get().authUser)
        if (get().authUser) return get().authUser
        set({ isCheckingAuth: true })

        try{
            const token = await get().getToken()
            if (!token) return

            const res = await axiosInstance.get("/user/", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            console.log("auth is still in proccess")
            if (!res) throw new Error("error getting user")


            const user = res.data.data
            if (!user) throw new Error("error getting user")
            
            set({ authUser: user })
        }  
        catch (error){
            console.error("An error occurred while checking auth: ", error)
            set({ authUser: null})  
        }
        finally{
            set({ isCheckingAuth: false })
        }
    }

}))