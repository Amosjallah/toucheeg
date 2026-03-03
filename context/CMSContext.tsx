'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

interface SiteSettings {
    site_name: string;
    site_tagline: string;
    site_logo: string;
    contact_email: string;
    contact_phone: string;
    contact_whatsapp: string;
    contact_address: string;
    social_facebook: string;
    social_instagram: string;
    social_twitter: string;
    social_tiktok: string;
    social_snapchat: string;
    social_youtube: string;
    primary_color: string;
    secondary_color: string;
    currency: string;
    currency_symbol: string;
    [key: string]: string;
}

interface CMSContent {
    id: string;
    section: string;
    block_key: string;
    title: string | null;
    subtitle: string | null;
    content: string | null;
    image_url: string | null;
    button_text: string | null;
    button_url: string | null;
    metadata: Record<string, any>;
    is_active: boolean;
}

interface Banner {
    id: string;
    name: string;
    type: string;
    title: string | null;
    subtitle: string | null;
    image_url: string | null;
    background_color: string;
    text_color: string;
    button_text: string | null;
    button_url: string | null;
    is_active: boolean;
    position: string;
    start_date: string | null;
    end_date: string | null;
}

interface CMSContextType {
    settings: SiteSettings;
    content: CMSContent[];
    banners: Banner[];
    loading: boolean;
    getContent: (section: string, blockKey: string) => CMSContent | undefined;
    getSetting: (key: string) => string;
    getActiveBanners: (position?: string) => Banner[];
    refreshCMS: () => Promise<void>;
}

const defaultSettings: SiteSettings = {
    site_name: 'TOUCHEEGLOW',
    site_tagline: 'Luxury Skincare — Canada',
    site_logo: '/tiwa logo.png',
    contact_email: 'tiwaperfumestyle@gmail.com',
    contact_phone: '0545010949',
    contact_whatsapp: '0554169992',
    contact_address: 'Canada',
    social_facebook: '',
    social_instagram: '',
    social_twitter: '',
    social_tiktok: '',
    social_snapchat: '',
    social_youtube: '',
    primary_color: '#2563eb',
    secondary_color: '#FBF6F2',
    currency: 'CAD',
    currency_symbol: 'CA$',
};

const CMSContext = createContext<CMSContextType | undefined>(undefined);

export function CMSProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
    const [content, setContent] = useState<CMSContent[]>([]);
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(false);

    // Initial load handled by state defaults, or fetch from DB if needed
    useEffect(() => {
        const fetchCMSData = async () => {
            try {
                setLoading(true);
                // Fetch settings
                const { data: settingsData } = await supabase.from('site_settings').select('*');
                if (settingsData) {
                    const mappedSettings = { ...defaultSettings };
                    settingsData.forEach(s => {
                        mappedSettings[s.key] = s.value;
                    });
                    setSettings(mappedSettings);
                }

                // Fetch content
                const { data: contentData } = await supabase.from('cms_content').select('*').eq('is_active', true);
                if (contentData) setContent(contentData);

                // Fetch banners
                const { data: bannersData } = await supabase.from('banners').select('*').eq('is_active', true);
                if (bannersData) setBanners(bannersData);

            } catch (err) {
                console.error('Error fetching CMS data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchCMSData();
    }, []);

    const getContent = (section: string, blockKey: string): CMSContent | undefined => {
        return content.find(c => c.section === section && c.block_key === blockKey);
    };

    const getSetting = (key: string): string => {
        return settings[key] || defaultSettings[key] || '';
    };

    const getActiveBanners = (position?: string): Banner[] => {
        const now = new Date();
        return banners.filter(b => {
            if (position && b.position !== position) return false;
            if (b.start_date && new Date(b.start_date) > now) return false;
            if (b.end_date && new Date(b.end_date) < now) return false;
            return b.is_active;
        });
    };

    const refreshCMS = async () => {
        // Redo fetchCMSData logic
    };

    return (
        <CMSContext.Provider
            value={{
                settings,
                content,
                banners,
                loading,
                getContent,
                getSetting,
                getActiveBanners,
                refreshCMS,
            }}
        >
            {children}
        </CMSContext.Provider>
    );
}

export function useCMS() {
    const context = useContext(CMSContext);
    if (!context) {
        throw new Error('useCMS must be used within a CMSProvider');
    }
    return context;
}

export default CMSContext;
