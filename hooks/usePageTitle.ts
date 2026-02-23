'use client';

import { useEffect } from 'react';

const SITE_NAME = 'TOUCHEEGLOW';

export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | Luxury Skincare Canada`;
  }, [title]);
}
