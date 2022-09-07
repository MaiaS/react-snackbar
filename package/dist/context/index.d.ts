import React from 'react';
export declare const NotificationBarContext: React.Context<ContextInterface | null>;
declare type ProviderProps = {
    col?: 'start' | 'flex-start' | 'center' | 'flex-end' | 'end';
    row?: 'start' | 'flex-start' | 'center' | 'flex-end' | 'end';
    animationDirection?: AnimationString;
    render?: (ctx: {
        notification: NotificationObject | null;
    }) => React.ReactElement;
};
export declare const NotificationBarProvider: React.FC<ProviderProps>;
export declare const Notification: React.FC;
export {};
