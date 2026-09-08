using System;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Threading;
using System.Windows.Forms;

namespace DigiWarriorsLauncher
{
    static class Program
    {
        [STAThread]
        static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            Application.Run(new LauncherForm());
        }
    }

    public class LauncherForm : Form
    {
        private Process serverProcess;
        private Label lblTitle;
        private Label lblStatus;
        private Label lblLocalUrl;
        private Label lblNetworkUrl;
        private Button btnOpenBrowser;
        private Button btnExportResults;
        private Button btnRestart;
        private Button btnExit;
        private System.Windows.Forms.Timer statusTimer;
        private string appDir;
        private string localIp;
        private int port = 3000;

        public LauncherForm()
        {
            appDir = AppDomain.CurrentDomain.BaseDirectory;
            localIp = GetLocalIpAddress();

            InitializeComponent();
            StartServer();
        }

        private void InitializeComponent()
        {
            this.Text = "Digi Warriors Assessment Platform";
            this.Size = new Size(540, 400);
            this.StartPosition = FormStartPosition.CenterScreen;
            this.FormBorderStyle = FormBorderStyle.FixedSingle;
            this.MaximizeBox = false;
            this.BackColor = Color.FromArgb(15, 23, 42); // Slate-900
            this.ForeColor = Color.White;

            // Load Icon if exists
            string iconPath = Path.Combine(appDir, "app.ico");
            if (File.Exists(iconPath))
            {
                try { this.Icon = new Icon(iconPath); } catch { }
            }

            // Header Icon / Banner
            Panel headerPanel = new Panel
            {
                Dock = DockStyle.Top,
                Height = 80,
                BackColor = Color.FromArgb(30, 41, 59) // Slate-800
            };

            lblTitle = new Label
            {
                Text = "⚔️ DIGI WARRIORS - COURSE 1",
                Font = new Font("Segoe UI", 14, FontStyle.Bold),
                ForeColor = Color.FromArgb(56, 189, 248), // Sky-400
                Location = new Point(20, 16),
                AutoSize = true
            };

            Label lblSubtitle = new Label
            {
                Text = "Local Examination Server & Real-time Live Session Manager",
                Font = new Font("Segoe UI", 9, FontStyle.Regular),
                ForeColor = Color.FromArgb(148, 163, 184), // Slate-400
                Location = new Point(22, 45),
                AutoSize = true
            };

            headerPanel.Controls.Add(lblTitle);
            headerPanel.Controls.Add(lblSubtitle);
            this.Controls.Add(headerPanel);

            // Status Section
            Panel contentPanel = new Panel
            {
                Location = new Point(20, 95),
                Size = new Size(485, 175),
                BackColor = Color.FromArgb(2, 6, 23) // Slate-950
            };
            contentPanel.Paint += (s, e) =>
            {
                using (Pen pen = new Pen(Color.FromArgb(51, 65, 85), 1))
                {
                    e.Graphics.DrawRectangle(pen, 0, 0, contentPanel.Width - 1, contentPanel.Height - 1);
                }
            };

            lblStatus = new Label
            {
                Text = "● Server Status: Starting...",
                Font = new Font("Segoe UI", 10, FontStyle.Bold),
                ForeColor = Color.FromArgb(251, 191, 36), // Amber-400
                Location = new Point(15, 15),
                AutoSize = true
            };

            lblLocalUrl = new Label
            {
                Text = "Trainer URL: http://localhost:3000",
                Font = new Font("Consolas", 10, FontStyle.Regular),
                ForeColor = Color.FromArgb(241, 245, 249),
                Location = new Point(15, 45),
                AutoSize = true
            };

            lblNetworkUrl = new Label
            {
                Text = "Participant Join URL: http://" + localIp + ":" + port,
                Font = new Font("Consolas", 10, FontStyle.Regular),
                ForeColor = Color.FromArgb(52, 211, 153), // Emerald-400
                Location = new Point(15, 75),
                AutoSize = true
            };

            Label lblHint = new Label
            {
                Text = "Share the Participant URL with attendees connected to the same Wi-Fi / LAN.\nNo internet connection or cloud server required.",
                Font = new Font("Segoe UI", 8.5f, FontStyle.Italic),
                ForeColor = Color.FromArgb(148, 163, 184),
                Location = new Point(15, 115),
                Size = new Size(455, 45)
            };

            contentPanel.Controls.Add(lblStatus);
            contentPanel.Controls.Add(lblLocalUrl);
            contentPanel.Controls.Add(lblNetworkUrl);
            contentPanel.Controls.Add(lblHint);
            this.Controls.Add(contentPanel);

            // Action Buttons
            btnOpenBrowser = new Button
            {
                Text = "🌐 Open in Browser",
                Font = new Font("Segoe UI", 9.5f, FontStyle.Bold),
                Location = new Point(20, 285),
                Size = new Size(150, 42),
                BackColor = Color.FromArgb(37, 99, 235), // Blue-600
                ForeColor = Color.White,
                FlatStyle = FlatStyle.Flat,
                Cursor = Cursors.Hand
            };
            btnOpenBrowser.FlatAppearance.BorderSize = 0;
            btnOpenBrowser.Click += (s, e) => OpenUrl("http://localhost:3000");

            btnExportResults = new Button
            {
                Text = "📊 Export Excel",
                Font = new Font("Segoe UI", 9.5f, FontStyle.Bold),
                Location = new Point(180, 285),
                Size = new Size(140, 42),
                BackColor = Color.FromArgb(16, 185, 129), // Emerald-600
                ForeColor = Color.White,
                FlatStyle = FlatStyle.Flat,
                Cursor = Cursors.Hand
            };
            btnExportResults.FlatAppearance.BorderSize = 0;
            btnExportResults.Click += (s, e) => OpenUrl("http://localhost:3000/api/export-master");

            btnRestart = new Button
            {
                Text = "🔄 Restart",
                Font = new Font("Segoe UI", 9, FontStyle.Regular),
                Location = new Point(330, 285),
                Size = new Size(80, 42),
                BackColor = Color.FromArgb(51, 65, 85),
                ForeColor = Color.White,
                FlatStyle = FlatStyle.Flat,
                Cursor = Cursors.Hand
            };
            btnRestart.FlatAppearance.BorderSize = 0;
            btnRestart.Click += (s, e) => RestartServer();

            btnExit = new Button
            {
                Text = "❌ Stop & Exit",
                Font = new Font("Segoe UI", 9, FontStyle.Regular),
                Location = new Point(420, 285),
                Size = new Size(85, 42),
                BackColor = Color.FromArgb(225, 29, 72), // Rose-600
                ForeColor = Color.White,
                FlatStyle = FlatStyle.Flat,
                Cursor = Cursors.Hand
            };
            btnExit.FlatAppearance.BorderSize = 0;
            btnExit.Click += (s, e) => this.Close();

            this.Controls.Add(btnOpenBrowser);
            this.Controls.Add(btnExportResults);
            this.Controls.Add(btnRestart);
            this.Controls.Add(btnExit);

            this.FormClosing += LauncherForm_FormClosing;

            statusTimer = new System.Windows.Forms.Timer { Interval = 1500 };
            statusTimer.Tick += (s, e) => CheckServerHealth();
            statusTimer.Start();
        }

        private void StartServer()
        {
            try
            {
                string serverScript = Path.Combine(appDir, "server", "index.js");
                if (!File.Exists(serverScript))
                {
                    // Check parent or fallback
                    serverScript = Path.Combine(appDir, "index.js");
                }

                ProcessStartInfo psi = new ProcessStartInfo
                {
                    FileName = "node.exe",
                    Arguments = "\"" + serverScript + "\"",
                    WorkingDirectory = appDir,
                    UseShellExecute = false,
                    CreateNoWindow = true,
                    RedirectStandardOutput = false,
                    RedirectStandardError = false
                };

                serverProcess = Process.Start(psi);

                // Wait 1.2s and open browser automatically on first launch
                new Thread(() =>
                {
                    Thread.Sleep(1200);
                    OpenUrl("http://localhost:3000");
                }).Start();
            }
            catch (Exception ex)
            {
                MessageBox.Show("Failed to launch Node.js server. Please ensure Node.js is installed.\n\nError: " + ex.Message, "Digi Warriors Launcher", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private void RestartServer()
        {
            KillServer();
            Thread.Sleep(500);
            StartServer();
            lblStatus.Text = "● Server Status: Restarted";
            lblStatus.ForeColor = Color.FromArgb(56, 189, 248);
        }

        private void CheckServerHealth()
        {
            try
            {
                HttpWebRequest req = (HttpWebRequest)WebRequest.Create("http://localhost:3000/api/info");
                req.Timeout = 1000;
                using (HttpWebResponse resp = (HttpWebResponse)req.GetResponse())
                {
                    if (resp.StatusCode == HttpStatusCode.OK)
                    {
                        lblStatus.Text = "● Server Status: Active & Ready (Port 3000)";
                        lblStatus.ForeColor = Color.FromArgb(52, 211, 153); // Emerald-400
                        return;
                    }
                }
            }
            catch
            {
                lblStatus.Text = "● Server Status: Offline / Connecting...";
                lblStatus.ForeColor = Color.FromArgb(244, 63, 94); // Rose-500
            }
        }

        private void OpenUrl(string url)
        {
            try
            {
                Process.Start(new ProcessStartInfo(url) { UseShellExecute = true });
            }
            catch (Exception ex)
            {
                MessageBox.Show("Unable to open browser: " + ex.Message);
            }
        }

        private void KillServer()
        {
            try
            {
                if (serverProcess != null && !serverProcess.HasExited)
                {
                    serverProcess.Kill();
                    serverProcess.Dispose();
                    serverProcess = null;
                }
            }
            catch { }
        }

        private void LauncherForm_FormClosing(object sender, FormClosingEventArgs e)
        {
            statusTimer.Stop();
            KillServer();
        }

        private string GetLocalIpAddress()
        {
            try
            {
                var host = Dns.GetHostEntry(Dns.GetHostName());
                foreach (var ip in host.AddressList)
                {
                    if (ip.AddressFamily == AddressFamily.InterNetwork && !IPAddress.IsLoopback(ip))
                    {
                        return ip.ToString();
                    }
                }
            }
            catch { }
            return "127.0.0.1";
        }
    }
}
