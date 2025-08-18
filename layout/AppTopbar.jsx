/* eslint-disable @next/next/no-img-element */
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { forwardRef, useContext, useImperativeHandle, useRef, useState, useEffect } from 'react';
import { LayoutContext } from './context/layoutcontext';
import { useAuth } from './context/AuthContext'; // Impor useAuth

const AppTopbar = forwardRef((props, ref) => {
    const { onMenuToggle } = useContext(LayoutContext);
    const menubuttonRef = useRef(null);
    const topbarmenuRef = useRef(null);
    const topbarmenubuttonRef = useRef(null);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

    // Gunakan state dan fungsi dari AuthContext
    const { user, logout } = useAuth();
    const router = useRouter();

    useImperativeHandle(ref, () => ({
        menubutton: menubuttonRef.current,
        topbarmenu: topbarmenuRef.current,
        topbarmenubutton: topbarmenubuttonRef.current
    }));

    // --- PERBAIKAN UTAMA: FUNGSI LOGOUT ---
    const handleLogout = async () => {
        try {
            await logout(); // Cukup panggil fungsi logout dari context
            // Tidak perlu hapus cookie manual atau redirect, context & middleware sudah menangani
            window.location.href = '/auth/login'; // Paksa reload penuh untuk membersihkan semua state
        } catch (error) {
            console.error("Logout error:", error);
            // Jika gagal, tetap paksa redirect
            window.location.href = '/auth/login';
        }
    };

    const toggleProfileDropdown = () => {
        setIsProfileDropdownOpen((prev) => !prev);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                topbarmenuRef.current && !topbarmenuRef.current.contains(event.target) &&
                topbarmenubuttonRef.current && !topbarmenubuttonRef.current.contains(event.target)
            ) {
                setIsProfileDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Jika user belum ada (masih loading atau belum login), tampilkan topbar minimal
    if (!user) {
        return (
            <div className="layout-topbar">
                <Link href="/" className="layout-topbar-logo">
                    <span>Work-Order</span>
                </Link>
            </div>
        );
    }

    return (
        <div className="layout-topbar">
            <Link href="/" className="layout-topbar-logo">
                <img src={`/layout/images/logo-dark.svg`} width="47.22px" height={'35px'} alt="logo" />
                <span>Work-Order</span>
            </Link>

            <button ref={menubuttonRef} type="button" className="p-link layout-menu-button layout-topbar-button" onClick={onMenuToggle}>
                <i className="pi pi-bars" />
            </button>

            <div className="layout-topbar-actions">
                <span>
                    {user.name} | {user.role}
                </span>

                <div className="profile-dropdown-container">
                    <button ref={topbarmenubuttonRef} type="button" className="p-link layout-topbar-button profile-button" onClick={toggleProfileDropdown} aria-expanded={isProfileDropdownOpen}>
                        {user.avatar_url ? (
                            <img
                                src={user.avatar_url}
                                alt="Profile"
                                className="profile-photo"
                                style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    objectFit: 'cover'
                                }}
                            />
                        ) : (
                            <i className="pi pi-user"></i>
                        )}
                        <span>Profile</span>
                    </button>

                    {isProfileDropdownOpen && (
                        <div ref={topbarmenuRef} className="profile-dropdown">
                            <Link href="/profile" className="dropdown-item" onClick={toggleProfileDropdown}>
                                <i className="pi pi-user"></i>
                                <span>My Profile</span>
                            </Link>
                            <div className="dropdown-divider"></div>
                            <div className="dropdown-item logout-item" onClick={handleLogout}>
                                <i className="pi pi-sign-out"></i>
                                <span>Logout</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

AppTopbar.displayName = "AppTopbar";

export default AppTopbar;
