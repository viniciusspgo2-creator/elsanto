'use client';

import {useEffect} from 'react';
import {usePathname} from 'next/navigation';

/** Progressive enhancement: content stays visible without JavaScript or IntersectionObserver. */
export function ScrollExperience(){
  const pathname=usePathname();
  useEffect(()=>{
    if(pathname.startsWith('/admin')||pathname.startsWith('/entregador'))return;
    if(!('IntersectionObserver' in window)||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const targets=Array.from(document.querySelectorAll<HTMLElement>(
      '.section-head, .product-card, .orderway, .gallery-tile, .story-content, .printed-menu-card, .editorial-photo, .cta-inner, .cms-public-card'
    ));
    const viewportHeight=window.innerHeight;
    targets.forEach((element,index)=>{
      element.dataset.inView=element.getBoundingClientRect().top < viewportHeight*0.91?'true':'false';
      element.style.setProperty('--el-stagger',`${(index%4)*55}ms`);
    });
    document.documentElement.classList.add('motion-ready');
    const observer=new IntersectionObserver(entries=>{
      for(const entry of entries){
        if(entry.isIntersecting){
          (entry.target as HTMLElement).dataset.inView='true';
          observer.unobserve(entry.target);
        }
      }
    },{rootMargin:'0px 0px -7% 0px',threshold:0.06});
    targets.forEach(t=>{if(t.dataset.inView!=='true')observer.observe(t)});
    return ()=>{
      observer.disconnect();
      document.documentElement.classList.remove('motion-ready');
      targets.forEach(t=>{delete t.dataset.inView;t.style.removeProperty('--el-stagger')});
    };
  },[pathname]);
  return null;
}
