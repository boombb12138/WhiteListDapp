import Head from "next/head";
import styles from "../styles/Home.module.css";
import Web3Modal from "web3modal";
import { providers, Contract } from "ethers";
import { useEffect, useRef, useState } from "react";
import { WHITELIST_CONTRACT_ADDRESS, abi } from "../constants";

export default function Home() {
  // walletConnected跟踪用户的钱包是否已经连接
  const [walletConnected, setWalletConnected] = useState(false);
  // joinedWhitelist跟踪目前的地址是否加入了白名单
  const [joinedWhitelist, setJoinedWhitelist] = useState(false);
  // loading设置为true(当我们在等待交易get mined的时候)
  const [loading, setLoading] = useState(false);
  //numberOfWhitelisted 跟踪有多少个地址在白名单上面
  const [numberOfWhitelisted, setNumberOfWhitelisted] = useState(0);
  // 创建一个reference到Web3modal，用来连接metamask。只要页面是open的，就存在
  const web3ModalRef = useRef();

  // 返回一个Provider或者signer对象 代表PRC节点
  const getProviderOrSigner = async (needSigner = false) => {
    // 连接metamask
    //todo  因为web3ModalRef是一个ref对象 所以 我们要访问current值来访问底层对象
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    // 如果用户没有连接到goerli测试网，就抛出一个错误
    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 5) {
      window.alert("Change the network to Goerli");
      throw new Error("Change network to Goerli");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  // 添加现在连接的地址到白名单
  const addAddressToWhitelist = async () => {
    try {
      // 我们需要一个Signer因为这是写入操作
      const signer = await getProviderOrSigner(true);
      // 创建一个可写合约
      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        signer
      );
      // 调用合约的addAddressToWhitelist方法
      const tx = await whitelistContract.addAddressToWhitelist();
      setLoading(true);
      await tx.wait();
      setLoading(false);
      // 得到白名单中地址总数
      await getNumberOfWhitelisted();
      setJoinedWhitelist(true);
    } catch (err) {
      console.error(err);
    }
  };

  // 得到白名单地址总数
  const getNumberOfWhitelisted = async () => {
    try {
      const provider = await getProviderOrSigner(); //只需要读合约，所以needsigner是false
      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        provider
      );
      const _numberOfWhitelisted =
        await whitelistContract.numAddressesWhitelisted();
      setNumberOfWhitelisted(_numberOfWhitelisted);
    } catch (err) {
      console.error(err);
    }
  };

  // 检查地址是否在白名单里面
  const checkIfAddressInWhitelist = async () => {
    try {
      // signer是一种特殊的provider
      // 所以即使这里是只读操作，我们也可以使用signer
      const signer = await getProviderOrSigner(true);
      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        signer
      );
      // 得到连接metamask的signer的地址
      const address = await signer.getAddress();
      const _joinedWhitelist = await whitelistContract.whitelistedAddresses(
        address
      );
      setJoinedWhitelist(_joinedWhitelist);
    } catch (err) {
      console.error(err);
    }
  };

  // 连接钱包
  const connectWallet = async () => {
    try {
      // 得到provider
      await getProviderOrSigner();
      setWalletConnected(true);

      checkIfAddressInWhitelist();
      getNumberOfWhitelisted();
    } catch (err) {
      console.error(err);
    }
  };

  // 返回一个基于dapp状态的anniu
  const renderButton = () => {
    if (walletConnected) {
      if (joinedWhitelist) {
        return (
          // todo styles.description?
          <div className={styles.description}>
            Thanks for joining the Whitelist!
          </div>
        );
      } else if (loading) {
        return <button className={styles.button}>Loading...</button>;
      } else {
        return (
          <button onClick={addAddressToWhitelist} className={styles.button}>
            Join the Whitelist
          </button>
        );
      }
    } else {
      return (
        <button onClick={connectWallet} className={styles.button}>
          Connect your wallet
        </button>
      );
    }
  };

  useEffect(() => {
    //todo 如果钱包没有连接，就创建一个新的Web3Modal实例,然后连接钱包
    // 只要页面是打开的，current值就一直存在
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "goerli",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
    }
  }, [walletConnected]);

  return (
    <div>
      <Head>
        <title>Whitelist Dapp</title>
        <meta name="description" content="Whitelist-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>你好~Welcome to Crypto Devs!</h1>
          <div className={styles.description}>
            It's an NFT collection for developers in Crypto.
          </div>
          <div className={styles.description}>
            {numberOfWhitelisted} have already joined the Whitelist
          </div>
          {renderButton()}
        </div>
        <div>
          <img className={styles.image} src="./crypto-devs.svg" />
        </div>
      </div>

      {/* //todo  这里的&#10084;是什么 */}
      <footer className={styles.footer}>
        Made with &#10084; by Crypto Devs
      </footer>
    </div>
  );
}
