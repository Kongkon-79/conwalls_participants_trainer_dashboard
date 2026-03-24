import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

interface LanguageValues {
    en: string;
    de: string;
}

interface NamedItem {
    name: string;
    labels?: LanguageValues;
}

interface NamedValueItem extends NamedItem {
    values: LanguageValues;
}

interface CategoryItem extends NamedItem {
    measureTypes?: NamedValueItem[];
}

export interface SystemSettingData {
    helpTexts: NamedValueItem[];
    stakeholderHelpTexts: NamedValueItem[];
    roleTypes: NamedItem[];
    categoryTypes: CategoryItem[];
    measureTypes: NamedValueItem[];
}

export function useSystemSettings() {
    const session = useSession();
    const token = (session?.data?.user as { accessToken?: string })?.accessToken;

    return useQuery({
        queryKey: ['system-setting'],
        queryFn: async (): Promise<SystemSettingData> => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/system-setting`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!res.ok) {
                throw new Error('Failed to fetch system settings');
            }
            const data = await res.json();
            return data.data?.items?.[0] || {
                helpTexts: [],
                stakeholderHelpTexts: [],
                roleTypes: [],
                categoryTypes: [],
                measureTypes: [],
            };
        },
        enabled: !!token,
        staleTime: Infinity,
        gcTime: Infinity,
    });
}
