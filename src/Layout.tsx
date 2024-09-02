import React from 'react';
import {Outlet} from 'react-router-dom';
import {PageContainer} from './styles/Layout';

const Layout: React.FC = () => {
    return (
        <>
            <PageContainer>
                <Outlet />
            </PageContainer>
        </>
    );
};

export default Layout;
