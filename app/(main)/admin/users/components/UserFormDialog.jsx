"use client";

import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { classNames } from "primereact/utils";
import { useState, useEffect } from "react";

const UserFormDialog = ({ visible, onHide, user, fetchUsers, showToast }) => {
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        role: "user",
        status: "active"
    });
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const roleOptions = [
        { label: "Admin", value: "admin" },
        { label: "User", value: "user" }
    ];

    const statusOptions = [
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" }
    ];

    useEffect(() => {
        if (user) {
            setForm({
                name: user.name || "",
                email: user.email || "",
                password: "", // Always empty for edit mode
                role: user.role || "user",
                status: user.status || "active"
            });
        } else {
            setForm({
                name: "",
                email: "",
                password: "",
                role: "user",
                status: "active"
            });
        }
        setSubmitted(false);
    }, [user, visible]);

    const handleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const validateForm = () => {
        const errors = {};

        if (!form.name.trim()) errors.name = "Name is required";
        if (!form.email.trim()) errors.email = "Email is required";
        if (!user && !form.password.trim()) errors.password = "Password is required";
        if (form.email && !/\S+@\S+\.\S+/.test(form.email)) errors.email = "Email is invalid";

        return errors;
    };

    const handleSubmit = async () => {
        setSubmitted(true);
        const errors = validateForm();

        if (Object.keys(errors).length > 0) {
            const firstError = Object.values(errors)[0];
            showToast("error", "Validation Error", firstError);
            return;
        }

        setLoading(true);
        try {
            const payload = { ...form };
            // Don't send empty password for updates
            if (user && !payload.password.trim()) {
                delete payload.password;
            }

            // Menggunakan API route handler yang baru
            const url = user ? `/api/admin/users/${user.id}` : "/api/admin/users";
            const method = user ? "PATCH" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Gagal menyimpan user");
            }

            showToast("success", "Sukses", data.message || "User berhasil disimpan");
            fetchUsers();
            onHide();
        } catch (error) {
            showToast("error", "Error", error.message);
        } finally {
            setLoading(false);
        }
    };

    const dialogFooter = (
        <div className="flex justify-end gap-2">
            <Button
                label="Cancel"
                icon="pi pi-times"
                onClick={onHide}
                className="p-button-text"
                disabled={loading}
            />
            <Button
                label={user ? "Update" : "Save"}
                icon="pi pi-check"
                onClick={handleSubmit}
                loading={loading}
                disabled={loading}
            />
        </div>
    );

    return (
        <Dialog
            header={user ? "Edit User" : "Add New User"}
            visible={visible}
            style={{ width: "32rem" }}
            breakpoints={{ "960px": "75vw", "641px": "90vw" }}
            onHide={onHide}
            modal
            className="p-fluid"
            footer={dialogFooter}
        >
            <div className="field grid mb-4">
                <label htmlFor="name" className="col-12 mb-2 font-medium">
                    Name <span className="text-red-500">*</span>
                </label>
                <div className="col-12">
                    <InputText
                        id="name"
                        value={form.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        placeholder="Enter full name"
                        className={classNames({
                            "p-invalid": submitted && !form.name.trim()
                        })}
                    />
                    {submitted && !form.name.trim() &&
                        <small className="p-error">Name is required</small>
                    }
                </div>
            </div>

            <div className="field grid mb-4">
                <label htmlFor="email" className="col-12 mb-2 font-medium">
                    Email <span className="text-red-500">*</span>
                </label>
                <div className="col-12">
                    <InputText
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        placeholder="Enter email address"
                        className={classNames({
                            "p-invalid": submitted && (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email))
                        })}
                    />
                    {submitted && !form.email.trim() &&
                        <small className="p-error">Email is required</small>
                    }
                    {submitted && form.email.trim() && !/\S+@\S+\.\S+/.test(form.email) &&
                        <small className="p-error">Email is invalid</small>
                    }
                </div>
            </div>

            <div className="field grid mb-4">
                <label htmlFor="password" className="col-12 mb-2 font-medium">
                    Password {!user && <span className="text-red-500">*</span>}
                    {user && <small className="text-gray-500"> (leave empty to keep current)</small>}
                </label>
                <div className="col-12">
                    <Password
                        id="password"
                        value={form.password}
                        onChange={(e) => handleChange("password", e.target.value)}
                        placeholder={user ? "Enter new password (optional)" : "Enter password"}
                        toggleMask
                        className={classNames({
                            "p-invalid": submitted && !user && !form.password.trim()
                        })}
                        inputClassName="w-full"
                    />
                    {submitted && !user && !form.password.trim() &&
                        <small className="p-error">Password is required</small>
                    }
                </div>
            </div>

            <div className="field grid mb-4">
                <label htmlFor="role" className="col-12 mb-2 font-medium">
                    Role <span className="text-red-500">*</span>
                </label>
                <div className="col-12">
                    <Dropdown
                        id="role"
                        value={form.role}
                        options={roleOptions}
                        onChange={(e) => handleChange("role", e.value)}
                        placeholder="Select role"
                    />
                </div>
            </div>

            <div className="field grid mb-6">
                <label htmlFor="status" className="col-12 mb-2 font-medium">
                    Status <span className="text-red-500">*</span>
                </label>
                <div className="col-12">
                    <Dropdown
                        id="status"
                        value={form.status}
                        options={statusOptions}
                        onChange={(e) => handleChange("status", e.value)}
                        placeholder="Select status"
                    />
                </div>
            </div>
        </Dialog>
    );
};

export default UserFormDialog;
