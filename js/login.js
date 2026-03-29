// kiểm tra học sinh điền gì
function check(){
    const user = document.getElementById("username").value;
    const pass = document.getElementById("password").value;
    const aduser = "admin";
    const adpass = "admin123@"
    if ((user === aduser) && (pass===adpass))
    {
        alert("Đăng nhập thành công! Chào mừng em đến với lớp Cầu lông.");
        // Chuyển hướng sang trang index.html
        window.location.href = "index.html"; 
    } 
    else 
    {
        // Nếu sai thì báo lỗi
        alert("Sai tên đăng nhập hoặc mật khẩu rồi. Em kiểm tra lại nhé!");
    }
}
