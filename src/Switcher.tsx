import React from 'react';
import {Routes, Route, Navigate} from 'react-router-dom';
import Layout from './Layout';
import Home from './pages/Home';

const Switcher: React.FC = () => {
    return (
        <Routes>
            <Route element={<Layout />}>
                <Route path="/" element={<Home />} />
                {/* redirects to home if none of the links were correct */}
                <Route path="*" element={<Navigate to="/" />} />
            </Route>
        </Routes>
    );
};

export default Switcher;
