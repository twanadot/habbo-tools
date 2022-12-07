import React from 'react';
import { NavLink } from 'react-router-dom';

function Header() {
    return (
        <nav className="navbar navbar-expand-sm navbar-dark">
            <div className="container">
            <div className="navbar-brand">HabboTools <div className="navbar-brand-subtext"><a href="https://krews.org">by <span className="text-orange-krews">Krews.org</span></a></div></div>
            <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#collapsibleNavbar">
                <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="collapsibleNavbar">
                <ul className="navbar-nav">
                    <li className="nav-item">
                        <NavLink exact to="/clothing" isActive={(_, { pathname }) => ["/", "/clothing"].includes(pathname)} className="nav-link">Clothing</NavLink>
                    </li>
                </ul>
            </div>
            </div>
        </nav>
    )
}

export default Header;