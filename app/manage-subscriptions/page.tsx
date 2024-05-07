'use client'
import { createClient } from "@/utils/supabase/client";
import { redirect } from "next/navigation";
import Link from "next/link";
import React, { useCallback, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

export default function Subscription() {
    const supabase = createClient();
    const router = useRouter()
    const [user, setUser] = useState<User | null>()
    const [selectedPlan, setSelectedPlan] = useState('')
    const [subscriptionPlans, setSubscriptionPlans] = useState<any[]>([])
    const [hasActivePlan, setHasActivePlan] = useState(false)
    useEffect(() => {
        async function getUser() {
            const {
                data: { user }
            } = await supabase.auth.getUser();
            if (!user) {
                return redirect("/login");
            }
            setUser(user)
            await getSubscriptionPlans(user)
        }
        getUser()
    }, [supabase])

    const getSubscriptionPlans = useCallback(async (user: User) => {
        try {
            const { data: subscriptionPlan } = await supabase.from('subscription_plans').select()
            if (subscriptionPlan) {
                setSubscriptionPlans(subscriptionPlan)
            }
            const { data } = await supabase.from('user_subscriptions').
                select(`subscription_id`).eq('id', user?.id)
            if (data && data.length) {
                const { data: activePlan } = await supabase.from('subscription_plans').select(`id, id`).eq('id', data[0].subscription_id).single()
                setSelectedPlan(activePlan?.id)
                setHasActivePlan(true)
            }
        } catch (error) {
            console.log('error', error)
            alert('Error loading subscription plans!')
        }
    }, [supabase, user])

    const handleSubscription = async (e: any) => {
        e.preventDefault()
        try {
            const { error } = await supabase.from('user_subscriptions').upsert({
                id: user?.id,
                user_id: user?.id,
                subscription_id: selectedPlan
            })
            if (error) throw error
            router.push('/dashboard')
        } catch (error) {
            console.log('error', error)
            alert('Error updting the data!')
        }
    }

    return (<>
        <Link
            href="/"
            className="absolute left-8 top-8 py-2 px-4 rounded-md no-underline text-foreground bg-btn-background hover:bg-btn-background-hover flex items-center group text-sm"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1"
            >
                <polyline points="15 18 9 12 15 6" />
            </svg>{" "}
            Back
        </Link>
        <div className="bg-white rounded-lg shadow-md p-8 mt-10 w-1/2 mx-auto">
            <div className="bg-gray-100 py-10 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="p-6">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Activate Subscription</h2>

                        <form>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Subscription Plan
                                </label>
                                <div className="flex items-center space-x-4">
                                    {subscriptionPlans?.map(({ id, name }) =>
                                        <React.Fragment key={`key-${id}`}>
                                            <input type="radio" id={name} name="subscription" value={id}
                                                onChange={() => setSelectedPlan(id)}
                                                checked={selectedPlan === id}
                                                className="text-indigo-600 focus:ring-indigo-500 h-4 w-4" />
                                            <label htmlFor={name} className="font-medium text-gray-700">{name.toUpperCase()}</label>
                                        </React.Fragment>
                                    )}
                                </div>
                            </div>

                            <div className="mt-4">
                                <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded" onClick={handleSubscription}>
                                    {hasActivePlan ? 'Update' : 'Activate'} Subscription
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </>
    );
}
