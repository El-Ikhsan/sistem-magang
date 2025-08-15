// Fungsi ini menyimulasikan penyimpanan data ke database
export const POST = (validatedData) => {
  console.log("Menyimpan data final ke database:", validatedData);

  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("Data berhasil disimpan.");
      resolve({ success: true, message: "Data KTP saved successfully." });
    }, 1000); // Jeda 1 detik
  });
};
