// app/routes/terms.tsx
import { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";

export const meta: MetaFunction = () => {
    return [
        { title: "プライバシーポリシー" },
        { name: "description", content: "サービスの利用規約ページ" }
    ];
};

export default function PrivacyPolicyOfService() {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">プライバシーポリシー</h1>
            
            <section className="mb-6">
                <p className="mb-4">bubutter（以下，「本サイト」といいます。）は，本サービスにおける，ユーザーの個人情報の取扱いについて， 以下のとおりプライバシーポリシー（以下，「本ポリシー」といいます。）を定めます。</p>

                <h3 className="text-xl font-semibold mb-4">第1条（個人情報）</h3>
                <p className="mb-4">
                    「個人情報」とは，個人情報保護法にいう「個人情報」を指すものとし，生存する個人に関する情報であって， 当該情報に含まれる氏名，生年月日，住所，電話番号， 連絡先その他の記述等により特定の個人を識別できる情報及び容貌，指紋，声紋にかかるデータ， 及び健康保険証の保険者番号などの当該情報単体から特定の個人を識別できる情報（個人識別情報）を指します。
                </p>

                <h3 className="text-xl font-semibold mb-4">第2条（個人情報の利用）</h3>
                <p className="mb-4">当サイトでは個人情報を扱っておりません。</p>

                <h3 className="text-xl font-semibold mb-4">第3条（利用目的の変更）</h3>
                <ol className="list-decimal pl-6 mb-4">
                    <li className="mb-2">当サイトは，利用目的が変更前と関連性を有すると合理的に認められる場合に限り，個人情報の利用目的を変更するものとします。</li>
                    <li>利用目的の変更を行った場合には，変更後の目的について， 当サイト所定の方法により，ユーザーに通知し，または本ウェブサイト上に公表するものとします。</li>
                </ol>

                <h3 className="text-xl font-semibold mb-4">第4条（プライバシーポリシーの変更）</h3>
                <ol className="list-decimal pl-6 mb-4">
                    <li className="mb-2">本ポリシーの内容は，法令その他本ポリシーに別段の定めのある事項を除いて，ユーザーに通知することなく， 変更することができるものとします。</li>
                    <li>当サイトが別途定める場合を除いて，変更後のプライバシーポリシーは， 本ウェブサイトに掲載したときから効力を生じるものとします。</li>
                </ol>

                <h3 className="text-xl font-semibold mb-4">第5条（お問い合わせ窓口）</h3>
                <p className="mb-4">本ポリシーに関するお問い合わせは，下記までお願いいたします。</p>
                    <p>
                        Twitter:
                        <a 
                            href={'https://twitter.com/@XBKu55Rjc752805'} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-blue-500 hover:underline"
                        >
                            @XBKu55Rjc752805
                        </a>
                    </p>
            </section>

            <footer className="mt-8">
                <Link
                    to="/"
                    className="text-blue-600 hover:underline"
                >
                    戻る
                </Link>
            </footer>

        </div>
    );
}