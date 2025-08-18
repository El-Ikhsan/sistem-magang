/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useContext, useState, useEffect } from "react";
import { LayoutContext } from "./context/layoutcontext";
import { MenuProvider } from "./context/menucontext";
import { Button } from "primereact/button";
import { usePathname, useRouter } from "next/navigation";
import { Dialog } from "primereact/dialog";
import { useAuth } from "./context/AuthContext";
import { classNames } from "primereact/utils";

const AppMenu = () => {
    const { layoutConfig } = useContext(LayoutContext);
    const pathname = usePathname();
    const router = useRouter();
    const [visible, setVisible] = useState(false);

    const { user, logout } = useAuth();
    const userRole = user?.role;

    const [menuGroups, setMenuGroups] = useState([]);

    useEffect(() => {
        if (userRole === "admin") {
            setMenuGroups([
                {
                    label: "OVERVIEW",
                    items: [
                        { label: "Dashboard", icon: "pi pi-fw pi-home", to: "/admin/dashboard" }
                    ]
                },
                {
                    label: "MANAJEMEN",
                    items: [
                        { label: "User Management", icon: "pi pi-fw pi-users", to: "/admin/users" },
                        { label: "Pendaftaran", icon: "pi pi-fw pi-file-edit", to: "/admin/pendaftaran" },
                        { label: "Logbook", icon: "pi pi-fw pi-book", to: "/admin/logbook" },
                        { label: "Sertifikat", icon: "pi pi-fw pi-award", to: "/admin/sertifikat" }
                    ]
                }
            ]);
        } else if (userRole === "user") {
            setMenuGroups([
                {
                    label: "OVERVIEW",
                    items: [
                        { label: "Dashboard", icon: "pi pi-fw pi-home", to: "/user/dashboard" }
                    ]
                },
                {
                    label: "AKTIVITAS",
                    items: [
                        { label: "Pendaftaran", icon: "pi pi-fw pi-file-edit", to: "/user/pendaftaran" },
                        { label: "Logbook", icon: "pi pi-fw pi-book", to: "/user/logbook" },
                        { label: "Sertifikat", icon: "pi pi-fw pi-award", to: "/user/sertifikat" }
                    ]
                },
                {
                    label: "PROFIL",
                    items: [
                        { label: "Profil Saya", icon: "pi pi-fw pi-user", to: "/user/profile" }
                    ]
                }
            ]);
        } else {
            setMenuGroups([]);
        }
    }, [userRole]);

    const handleNavigation = (e, to) => {
        e.preventDefault();
        router.push(to);
    };

    const handleLogout = async () => {
        try {
            await logout();
            router.push("/auth/login");
        } catch (error) {
            console.error("Logout error:", error);
            router.push("/auth/login");
        }
    };

    return (
        <MenuProvider>
            <div className="layout-menu">
                {menuGroups.map((group, groupIndex) => (
                    <div key={`group-${groupIndex}`} className="menu-group mb-4">
                        <div className="menu-group-header px-2 mb-2">
                            <span className="text-xs font-semibold text-color-secondary uppercase tracking-wider opacity-60">{group.label}</span>
                        </div>
                        <ul className="menu-group-items" style={{ listStyle: "none", margin: 0, padding: 0 }}>
                            {group.items.map((item, itemIndex) => (
                                <li key={`${groupIndex}-${itemIndex}`} className="mb-1">
                                    <a
                                        href={item.to}
                                        onClick={(e) => handleNavigation(e, item.to)}
                                        className={classNames("flex align-items-center py-3 px-3 cursor-pointer rounded-lg transition-all duration-200 text-color-secondary hover:bg-primary-50 hover:text-primary group", {
                                            "bg-primary-50 text-primary shadow-sm": pathname === item.to
                                        })}
                                        style={{ textDecoration: "none" }}
                                    >
                                        {item.icon && (
                                            <i
                                                className={classNames("mr-3 text-lg transition-colors duration-200", item.icon, {
                                                    "text-primary": pathname === item.to,
                                                    "group-hover:text-primary": pathname !== item.to
                                                })}
                                            ></i>
                                        )}
                                        <span className="font-medium text-sm">{item.label}</span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}

                {userRole && (
                    <div className="mt-auto pt-4 border-top-1 surface-border">
                        <div className="px-2">
                            <Button
                                icon="pi pi-sign-out"
                                label="Logout"
                                className="w-full p-button-outlined p-button-danger"
                                onClick={handleLogout}
                            />
                        </div>
                    </div>
                )}
            </div>

            <Dialog
                header="Schedule Delivery"
                visible={visible}
                onHide={() => {
                    if (!visible) return;
                    setVisible(false);
                }}
                style={{ width: "50vw" }}
            >
                {/* ... Konten Dialog ... */}
            </Dialog>

            <Button className={`${pathname !== "/analytics" ? "hidden" : ""} w-full mt-5`} label="Create Schedule" onClick={() => setVisible(true)} />
        </MenuProvider>
    );
};

export default AppMenu;
