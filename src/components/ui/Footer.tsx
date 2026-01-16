export function Footer() {
    return (
        <footer className="border-t border-white/10 bg-black/40">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-6 py-10 text-sm text-zinc-400 md:flex-row md:items-center md:justify-between">
                <p>
                    <span className="font-medium text-zinc-200">AIMlab</span> · FPS 瞄准训练原型
                </p>
                <p className="text-xs">
                    仅用于练习与产品原型展示；不隶属于任何商业 Aim Lab 品牌。
                </p>
            </div>
        </footer>
    );
}
